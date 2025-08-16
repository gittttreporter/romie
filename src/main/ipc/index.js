import { shell, ipcMain } from "electron";
import { registerDarkModeIpc } from "./darkMode";
import { registerRomIpc } from "./rom";
import { registerDeviceIpc } from "./device";
import { registerSyncIpc } from "./sync";

export function registerAllIpc() {
  registerDarkModeIpc();
  registerRomIpc();
  registerDeviceIpc();
  registerSyncIpc();

  // General utilities
  ipcMain.handle("util:openExternal", (_, url) => shell.openExternal(url));
}
