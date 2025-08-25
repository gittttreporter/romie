import log from "electron-log/main";
import { ipcMain, BrowserWindow } from "electron";
import path from "path";
import { readdir, stat } from "node:fs/promises";
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
  const results: ScanResult = { processed: 0, errors: [], skipped: [] };

  let files;
  try {
    files = await readdir(dirPath);
  } catch (error) {
    const dirError = new RomProcessingError(
      `Failed to read directory`,
      dirPath.toString(),
      error instanceof Error ? error.message : "Unknown error",
      error instanceof Error ? error : undefined,
    );
    results.errors.push(dirError);
    return results;
  }

  for (const file of files) {
    const subResults = await processFile(dirPath, file);

    results.processed += subResults.processed;
    results.errors.push(...subResults.errors);
  }

  return results;
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

    if (fileStats.isFile() && isRomFile(filename)) {
      emitProgress({ currentFile: filename });
      await processRomFile(fullPath, "scan");

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

function emitProgress(progress: ImportStatus) {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow?.webContents.send("rom:import-progress", progress);
}

function isRomFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();

  return SUPPORTED_EXTENSIONS.includes(ext);
}
