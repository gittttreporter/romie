import { dialog } from "electron";
import { getAllSupportedExtensions } from "@/utils/systems";
import { processRomFile } from "./romImport";
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
  };
  const fileTasks: Promise<Rom>[] = [];

  // Bail if the user canceled the file dialog
  if (canceled) {
    response.canceled = true;

    return response;
  }

  // Process all selected ROM files
  filePaths.forEach((filePath) => {
    fileTasks.push(processRomFile(filePath));
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
