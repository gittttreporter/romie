import { ipcMain } from "electron";
import { importRoms } from "@main/roms/romService";
import { listRoms, removeRomById, getRomStats } from "@main/roms/romDatabase";

export function registerRomIpc() {
  ipcMain.handle("rom:import", importRoms);
  ipcMain.handle("rom:list", listRoms);
  ipcMain.handle("rom:remove", (_, id) => removeRomById(id));
  ipcMain.handle("rom:stats", () => getRomStats());
}
