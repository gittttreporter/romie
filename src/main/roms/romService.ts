import { dialog } from "electron";
import { getAllSupportedExtensions } from "@/utils/systems";
import { processRomFile } from "./romImport";
import { processRomDirectory } from "./romScan";
import type { Rom } from "@/types/rom";
import type { RomImportResult } from "@/types/electron-api";

export async function importRoms(): Promise<RomImportResult> {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "ROM Files",
        extensions: getAllSupportedExtensions().map((ext) =>
          ext.replace(/^\./, ""),
        ),
      },
      {
        name: "All Files",
        extensions: ["*"],
      },
    ],
  });
  const response: RomImportResult = {
    canceled: false,
    imported: [],
    failed: [],
    totalProcessed: 0,
  };
  const fileTasks: Promise<Rom>[] = [];

  // Bail if the user canceled the file dialog
  if (canceled) {
    response.canceled = true;

    return response;
  }

  // Process all selected ROM files
  filePaths.forEach((filePath) => {
    // fileTasks.push(processRomFile(filePath, "import"));
  });

  // Handle processing results
  const results = await Promise.allSettled(fileTasks);

  results.forEach((res) => {
    if (res.status === "fulfilled") {
      response.imported.push(res.value);
    } else {
      response.failed.push({
        file: res.reason?.file || "unknown",
        reason: res.reason?.reason || "Unknown error",
      });
    }
  });

  return response;
}

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
