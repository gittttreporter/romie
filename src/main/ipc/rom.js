import { ipcMain } from 'electron';
import { importRoms } from '@main/roms/romService';


export function registerRomIpc() {
  ipcMain.handle('rom:import', importRoms);
}
