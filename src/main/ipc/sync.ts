import { ipcMain, BrowserWindow } from "electron";
import type { SyncOptions, SyncProgress } from "@/types/electron-api";

let syncCancelled = false;

function emitProgress(progress: SyncProgress) {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow?.webContents.send('sync:progress', progress);
}

async function startSync(tagIds: string[], deviceId: string, options: SyncOptions) {
  syncCancelled = false;
  
  // Preparing phase
  emitProgress({
    phase: 'preparing',
    filesProcessed: 0,
    totalFiles: 0,
    progressPercent: 0
  });
  
  await sleep(2000);
  if (syncCancelled) return;
  
  // Mock syncing
  const totalFiles = 25;
  for (let i = 1; i <= totalFiles; i++) {
    if (syncCancelled) break;
    
    emitProgress({
      phase: 'syncing',
      currentFile: `game-${i}.rom`,
      filesProcessed: i,
      totalFiles,
      progressPercent: Math.round((i / totalFiles) * 100)
    });
    
    await sleep(800);
  }
  
  if (!syncCancelled) {
    emitProgress({ phase: 'done', filesProcessed: totalFiles, totalFiles, progressPercent: 100 });
  }
}

function cancelSync() {
  syncCancelled = true;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function registerSyncIpc() {
  ipcMain.handle("sync:start", (_, tagIds, deviceId, options) => startSync(tagIds, deviceId, options));
  ipcMain.handle("sync:cancel", cancelSync);
}