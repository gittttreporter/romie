import { shell, ipcMain } from "electron";
import { registerDarkModeIpc } from "./darkMode";
import { registerRomIpc } from "./rom";

export function registerAllIpc() {
  registerDarkModeIpc();
  registerRomIpc();

  // General utilities
  ipcMain.handle("util:openExternal", (_, url) => shell.openExternal(url));
}
