import { ipcMain } from "electron";
import { importRoms } from "@main/roms/romService";
import {
  listRoms,
  removeRomById,
  getRomStats,
  updateRom,
} from "@main/roms/romDatabase";

export function registerRomIpc() {
  ipcMain.handle("rom:import", importRoms);
  ipcMain.handle("rom:list", listRoms);
  ipcMain.handle("rom:remove", (_, id) => removeRomById(id));
  ipcMain.handle("rom:update", (_, id, data) => updateRom(id, data));
  ipcMain.handle("rom:stats", () => getRomStats());
}
