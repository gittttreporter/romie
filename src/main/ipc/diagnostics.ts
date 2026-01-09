import { app, BrowserWindow, dialog, ipcMain, type SaveDialogOptions } from 'electron';
import logger from 'electron-log/main';
import path from 'node:path';

import type { ApiResult } from '@/types/electron-api';
import { exportLogsToZip } from '@main/diagnostics/logExport';

const log = logger.scope('ipc:diagnostics');

export function registerDiagnosticsIpc() {
  ipcMain.handle(
    'diagnostics:exportLogs',
    async (event): Promise<ApiResult<{ canceled: boolean }>> => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);

      const dateStr = new Date().toISOString().slice(0, 10);
      const defaultFileName = `romie-logs-${dateStr}.zip`;

      const saveDialogOptions: SaveDialogOptions = {
        title: 'Save Logs',
        defaultPath: path.join(app.getPath('downloads'), defaultFileName),
        buttonLabel: 'Save',
        filters: [
          { name: 'Zip Archive', extensions: ['zip'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      };

      const { filePath, canceled } = browserWindow
        ? await dialog.showSaveDialog(browserWindow, saveDialogOptions)
        : await dialog.showSaveDialog(saveDialogOptions);

      if (canceled || !filePath) {
        return { success: true, data: { canceled: true } };
      }

      try {
        await exportLogsToZip(filePath);
        return { success: true, data: { canceled: false } };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        log.error('Failed to export logs:', error);

        return {
          success: false,
          error: message,
          userMessage: 'Failed to export logs.',
        };
      }
    }
  );
}
