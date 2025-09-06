import { autoUpdater, type BrowserWindow } from "electron";
import logger from "electron-log/main";
import { updateElectronApp, UpdateSourceType } from "update-electron-app";

const log = logger.scope("updater");

export function initializeUpdater(mainWindow: BrowserWindow): void {
  log.info(`Initializing auto-updates for ${process.platform} ${process.arch}`);
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.StaticStorage,
      baseUrl: `https://romie.jzimz.com/releases/${process.platform}/${process.arch}`,
    },
    logger: log,
    onNotifyUser: ({ releaseName }) => {
      log.debug("Notifying user of update:", releaseName);
      mainWindow?.webContents.send("update:ready", releaseName);
    },
  });
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall();
}
