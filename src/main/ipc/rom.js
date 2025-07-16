import { ipcMain } from 'electron';
import { importRoms } from '@main/roms/romService';
import { listRoms } from '@main/roms/romDatabase';


export function registerRomIpc() {
  ipcMain.handle('rom:import', importRoms);
  ipcMain.handle('rom:list', listRoms);
}
