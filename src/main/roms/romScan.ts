import log from "electron-log/main";
import { ipcMain, BrowserWindow } from "electron";
import yauzl from "yauzl";
import path from "path";
import fs from "fs/promises";
import { readdir, stat } from "node:fs/promises";
import * as Sentry from "@sentry/electron/main";
import { processRomFile } from "./romImport";
import { getAllSupportedExtensions } from "@/utils/systems";
import { RomProcessingError } from "@/errors";
import type { PathLike } from "node:fs";
import type { ImportStatus } from "@/types/electron-api";

interface ScanResult {
  processed: number;
  errors: RomProcessingError[];
  skipped: string[];
}

const SUPPORTED_EXTENSIONS = getAllSupportedExtensions();

export async function processRomDirectory(
  dirPath: PathLike,
): Promise<ScanResult> {
  return await Sentry.startSpan(
    {
      op: "rom.scan",
      name: "Scan ROM Directory",
      attributes: {
        "scan.directory": dirPath.toString(),
      },
    },
    async (span) => {
      const results: ScanResult = { processed: 0, errors: [], skipped: [] };

      let files;
      try {
        files = await readdir(dirPath);
      } catch (error) {
        span.setStatus({ code: 2, message: "Failed to read directory" });
        span.recordException(
          error instanceof Error ? error : new Error(String(error)),
        );

        const dirError = new RomProcessingError(
          `Failed to read directory`,
          dirPath.toString(),
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error ? error : undefined,
        );
        results.errors.push(dirError);
        return results;
      }

      span.setAttributes({
        "scan.files_found": files.length,
      });

      for (const file of files) {
        const subResults = await processFile(dirPath, file);

        results.processed += subResults.processed;
        results.errors.push(...subResults.errors);
      }

      span.setAttributes({
        "scan.files_processed": results.processed,
        "scan.errors_count": results.errors.length,
      });

      return results;
    },
  );
}

//= Helpers ==

async function processFile(
  dirPath: PathLike,
  filename: string,
): Promise<ScanResult> {
  const fullPath = path.join(dirPath.toString(), filename);

  try {
    if (filename.startsWith(".")) {
      return { processed: 0, errors: [], skipped: [] };
    }

    const fileStats = await stat(fullPath);

    if (fileStats.isDirectory()) {
      return await processRomDirectory(fullPath);
    }

    if (fileStats.isFile()) {
      if (path.extname(filename).toLowerCase() === ".zip") {
        emitProgress({ currentFile: filename });
        const result = await processZipFile(fullPath);

        // If the zip was skipped for any reason then fall through to check if it's a direct ROM file
        // like an arcade game. This has the side effect of letting random zip files be treated as ROMs.
        if (result.skipped.length === 0) {
          return result;
        }
      }

      if (!isRomFile(filename)) {
        log.debug("Skipping unsupported file", filename);
        return { processed: 0, errors: [], skipped: [filename] };
      }

      emitProgress({ currentFile: filename });
      const fileBuffer = await fs.readFile(fullPath);
      await processRomFile(fullPath, filename, fileBuffer, "scan");

      return { processed: 1, errors: [], skipped: [] };
    }

    return { processed: 0, errors: [], skipped: [] };
  } catch (error) {
    const romError =
      error instanceof RomProcessingError
        ? error
        : new RomProcessingError(
            `Failed to process ROM: ${filename}`,
            fullPath,
            error instanceof Error ? error.message : "Unknown error",
            error instanceof Error ? error : undefined,
          );

    return {
      processed: 0,
      errors: [romError],
      skipped: [],
    };
  }
}

async function processZipFile(zipPath: string): Promise<ScanResult> {
  log.debug(`Checking for ROMs in ${zipPath}`);

  try {
    const romBuffer = await readRomFromZip(zipPath);

    if (!romBuffer) {
      log.warn(`No ROM files found in zip: ${zipPath}`);
      return { processed: 0, errors: [], skipped: [zipPath] };
    }

    await processRomFile(zipPath, romBuffer.fileName, romBuffer.buffer, "scan");

    return { processed: 1, errors: [], skipped: [] };
  } catch (error) {
    log.error(`Error processing zip file ${zipPath}:`, error);
    const zipError =
      error instanceof RomProcessingError
        ? error
        : new RomProcessingError(
            `Failed to process zip file`,
            zipPath,
            error instanceof Error ? error.message : "Unknown error",
            error instanceof Error ? error : undefined,
          );

    return { processed: 0, errors: [zipError], skipped: [] };
  }
}

/**
 * Enforces 1-ROM-per-zip constraint to maintain clean sync architecture.
 * Multiple ROMs in one zip would create mapping issues when syncing to devices
 * since each ROM entry needs a unique file path reference.
 */
async function readRomFromZip(zipPath: string): Promise<{
  fileName: string;
  buffer: Buffer;
} | null> {
  return new Promise((resolve, reject) => {
    let romFileName: string | null = null;
    let romBuffer: Buffer | null = null;

    yauzl.open(zipPath, { lazyEntries: true }, async (err, zipfile) => {
      if (err) {
        log.error(`Failed to open zip file ${zipPath}:`, err);

        reject(
          new RomProcessingError(
            `Failed to open zip file`,
            zipPath,
            err.message,
            err,
          ),
        );
        return;
      }

      zipfile.readEntry();

      zipfile.on("entry", async (entry) => {
        log.debug(`Processing zip entry: ${entry.fileName}`);
        // Directory file names end with '/' so skip them since we only care about files.
        if (/\/$/.test(entry.fileName)) {
          log.debug("Skipping directory", entry.fileName);
          zipfile.readEntry();
          return;
        }

        if (isRomFile(entry.fileName)) {
          log.debug(`Found rom file in zip: ${entry.fileName}`);

          if (romBuffer) {
            // Already found a ROM, so this is a violation of the 1-ROM-per-zip rule.
            reject(
              new RomProcessingError(
                `Multiple ROMs found in zip file`,
                zipPath,
                `Found multiple ROM files in zip file.`,
              ),
            );
            zipfile.close();
            return;
          }

          zipfile.openReadStream(entry, (err, readStream) => {
            log.debug("Starting read stream for", entry.fileName);
            if (err) {
              reject(
                new RomProcessingError(
                  `Failed to open read stream for ROM in zip`,
                  zipPath,
                  err.message,
                  err,
                ),
              );
              return;
            }

            const chunks: Buffer[] = [];
            readStream.on("data", (chunk) => chunks.push(chunk));
            readStream.on("end", function () {
              log.debug(`Read stream completed for: ${entry.fileName}`);
              romFileName = entry.fileName;
              romBuffer = Buffer.concat(chunks);
              zipfile.readEntry();
            });
          });
        } else {
          zipfile.readEntry();
        }
      });

      zipfile.on("error", (err) => {
        log.error(`Zip parsing error for ${zipPath}:`, err);
        reject(
          new RomProcessingError(
            `Zip file parsing failed`,
            zipPath,
            err.message,
            err,
          ),
        );
      });

      zipfile.on("end", () => {
        log.debug(
          `Zip processing completed. ROM found: ${romFileName || "none"}`,
        );
        if (romBuffer && romFileName) {
          resolve({ fileName: romFileName, buffer: romBuffer });
        } else {
          resolve(null);
        }
      });
    });
  });
}

function emitProgress(progress: ImportStatus) {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow?.webContents.send("rom:import-progress", progress);
}

function isRomFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();

  return SUPPORTED_EXTENSIONS.includes(ext);
}
