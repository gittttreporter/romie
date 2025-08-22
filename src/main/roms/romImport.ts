import path from "path";
import log from "electron-log/main";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { determineSystemFromExtension } from "@/utils/systems";
import {
  extractRegionFromFilename,
  cleanDisplayName,
  generateLibretroHashes,
  copyRomToLibrary,
} from "./romUtils";
import { addRom } from "./romDatabase";
import type { Rom } from "../../types/rom";

export async function processRomFile(filePath: string): Promise<Rom> {
  const filename = path.basename(filePath);

  try {
    log.info(`Processing ROM file: ${filename}`);

    // Get original filename + extension
    const originalFilename = path.basename(filePath);
    const fileExtension = path.extname(originalFilename);
    log.debug(`File extension: ${fileExtension}`);

    // Determine console from file extension
    log.debug("Determining system from extension");
    const system = determineSystemFromExtension(fileExtension);
    log.debug(`Detected system: ${system}`);

    // Extract region tag from filename e.g. (USA), (JPN) fallback: "Unknown"
    log.debug("Extracting region from filename");
    const region = extractRegionFromFilename(originalFilename);
    log.debug(`Detected region: ${region}`);

    // Create displayName by stripping: region tag, dump tags ([!], [v1.1]), punctuation
    const displayName = cleanDisplayName(originalFilename);
    log.debug(`Clean display name: ${displayName}`);

    // Generate hashes for deduplication and libretro lookups.
    log.debug("Generating hashes for ROM file");
    const hashes = await generateLibretroHashes(filePath);
    log.debug(
      `Generated hashes: MD5=${hashes.md5?.substring(0, 8)}..., SHA1=${hashes.sha1?.substring(0, 8)}...`,
    );

    // Get file size
    log.debug("Getting file statistics");
    const stats = await fs.stat(filePath);
    const size = stats.size;
    log.debug(`File size: ${(size / 1024 / 1024).toFixed(2)} MB`);

    // Create filename for saving (with region)
    const savedFilename = `${displayName} (${region})${fileExtension}`;
    log.debug(`Target filename: ${savedFilename}`);

    // Copy file to target location
    log.debug("Copying ROM to library");
    const targetPath = await copyRomToLibrary(filePath, savedFilename);
    log.debug(`ROM copied to: ${targetPath}`);

    // Create metadata object
    const now = Date.now();
    const metadata: Rom = {
      id: uuidv4(),
      system,
      displayName,
      region,
      filename: savedFilename,
      originalFilename,
      size,
      importedAt: now,
      lastUpdated: now,
      tags: [],
      notes: "",
      ...hashes,
    };

    // Update ROM database
    await addRom(metadata);

    log.info(`Successfully processed ROM: ${displayName} (${system})`);
    return metadata;
  } catch (error) {
    log.error(`Failed to process ROM file: ${filename}`, error);

    // Create a meaningful error that can be caught by importRoms()
    const romError = new Error(`Failed to process ROM: ${filename}`);
    (romError as any).file = filePath;
    (romError as any).reason =
      error instanceof Error ? error.message : "Unknown error";
    throw romError;
  }
}
