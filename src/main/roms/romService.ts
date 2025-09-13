import { dialog } from "electron";
import { processRomDirectory } from "./romScan";

import type { RomImportResult } from "@/types/electron-api";

export async function scanRomDirectory(): Promise<RomImportResult> {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  const response: RomImportResult = {
    canceled: false,
    imported: [],
    failed: [],
    totalProcessed: 0,
  };

  // Bail if the user canceled the file dialog
  if (canceled) {
    response.canceled = true;

    return response;
  }

  const romDir = filePaths[0];
  const { processed, errors } = await processRomDirectory(romDir);

  response.totalProcessed = processed;
  response.failed = errors.map((err) => ({
    file: err.file,
    reason: err.reason,
  }));

  return response;
}
