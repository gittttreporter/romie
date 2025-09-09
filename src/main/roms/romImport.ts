import path from "path";
import log from "electron-log/main";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import * as Sentry from "@sentry/electron/main";
import { hash } from "@romie/ra-hasher";
import {
  getConsoleIdForSystem,
  determineSystemFromExtension,
  determineSystemFromRAConsoleId,
} from "@/utils/systems";
import { RomProcessingError } from "@/errors";
import {
  extractRegionFromFilename,
  cleanDisplayName,
  generateLibretroHashes,
  copyRomToLibrary,
} from "./romUtils";
import { addRom } from "./romDatabase";
import { lookupRomByHash, unloadHashDatabase } from "./romLookup";

import type { Rom } from "@/types/rom";
import type { SystemCode } from "@/types/system";

export async function processRomFile(
  filePath: string,
  source: "import" | "scan",
): Promise<Rom> {
  return await Sentry.startSpan(
    {
      op: "rom.process",
      name: `Process ROM File - ${source}`,
      attributes: {
        "rom.source": source,
        "rom.extension": path.extname(filePath).toLowerCase(),
      },
    },
    async (span) => {
      const logSource = source.toUpperCase();
      const originalFilename = path.basename(filePath);
      const fileExtension = path.extname(originalFilename);
      log.debug(`File extension: ${fileExtension}`);

      try {
        log.info(`[${logSource}] Processing ROM file: ${originalFilename}`);

        // Determine system information from extension
        log.debug(`[${logSource}] Determining system from extension"`);
        const system = determineSystemFromExtension(fileExtension);
        const consoleId = getConsoleIdForSystem(system);
        log.debug(
          `[${logSource}] Detected system: ${system}, consoleId: ${consoleId}`,
        );

        // Generate ROM hashes for deduplication and RetroAchievements lookups.
        log.debug(`[${logSource}] Generating hashes for ROM file`);
        const hashes = await Sentry.startSpan(
          { op: "rom.hash", name: "Generate ROM Hashes" },
          async () => {
            const ramd5 = consoleId
              ? (await hash({ consoleId, path: filePath })).ramd5
              : null;
            const results = await generateLibretroHashes(filePath);

            return { ...results, ramd5 };
          },
        );
        log.debug(
          `[${logSource}] Generated hashes: MD5=${hashes.md5?.substring(0, 8)}..., SHA1=${hashes.sha1?.substring(0, 8)}...`,
        );

        // Attempt to identify game and system from file hash.
        // If no match by hash, fallback to extension-based detection and filename cleaning.
        const game = hashes.ramd5 ? await lookupRomByHash(hashes.ramd5) : null;
        let displayName: string;
        let verified = false;

        if (game) {
          log.debug(
            `[${logSource}] Found matching game in database: ${game.title} (${game.consoleName})`,
          );

          displayName = game.title;
          verified = true;
        } else {
          log.warn(
            `[${logSource}] No matching game found in database for hash.`,
          );

          // Create displayName by stripping: region tag, dump tags ([!], [v1.1]), punctuation
          displayName = cleanDisplayName(originalFilename);
          log.debug(`[${logSource}] Clean display name: ${displayName}`);
        }

        // Extract region tag from filename e.g. (USA), (JPN) fallback: "Unknown"
        log.debug(`[${logSource}] Extracting region from filename`);
        const region = extractRegionFromFilename(originalFilename);
        log.debug(`[${logSource}] Detected region: ${region}`);

        // Get file size
        log.debug(`[${logSource}] Getting file statistics`);
        const stats = await fs.stat(filePath);
        const size = stats.size;
        log.debug(
          `[${logSource}] File size: ${(size / 1024 / 1024).toFixed(2)} MB`,
        );

        // Copy to managed library if imported.
        let savedLocation = filePath;
        if (source === "import") {
          // Copy file to target location
          log.debug(`[${logSource}] Copying ROM to library`);
          savedLocation = await Sentry.startSpan(
            { op: "rom.copy", name: "Copy ROM to Library" },
            async () =>
              (await copyRomToLibrary(filePath, originalFilename)).toString(),
          );
          log.debug(`[${logSource}] ROM copied to: ${savedLocation}`);
        }

        // Create metadata object
        const now = Date.now();
        const metadata: Rom = {
          id: uuidv4(),
          system,
          displayName,
          region,
          filename: originalFilename, // TODO: consider renaming to savedFilename
          originalFilename, // TODO: consider if we need both filename and originalFilename
          filePath: savedLocation,
          source,
          size,
          importedAt: now,
          lastUpdated: now,
          tags: [],
          notes: "",
          favorite: false,
          verified,
          ...hashes,
        };

        // Update ROM database
        await Sentry.startSpan(
          { op: "rom.database", name: "Add ROM to Database" },
          () => addRom(metadata),
        );

        span.setAttributes({
          "rom.system": system,
          "rom.size_mb": Math.round((size / 1024 / 1024) * 100) / 100,
        });

        log.info(
          `[${logSource}] Successfully processed ROM: ${displayName} (${system})`,
        );
        unloadHashDatabase();

        return metadata;
      } catch (error) {
        span.setStatus({ code: 2, message: "ROM processing failed" });
        span.recordException(
          error instanceof Error ? error : new Error(String(error)),
        );

        log.error(
          `[${logSource}] Failed to process ROM file: ${originalFilename}`,
          error,
        );

        const romError = new RomProcessingError(
          `Failed to process ROM: ${originalFilename}`,
          filePath,
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error ? error : undefined,
        );

        throw romError;
      }
    },
  );
}
