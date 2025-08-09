import { shell, ipcMain } from "electron";
import { registerDarkModeIpc } from "./darkMode";
import { registerRomIpc } from "./rom";
import { registerDeviceIpc } from "./device";

export function registerAllIpc() {
  registerDarkModeIpc();
  registerRomIpc();
  registerDeviceIpc();

  // General utilities
  ipcMain.handle("util:openExternal", (_, url) => shell.openExternal(url));
}
