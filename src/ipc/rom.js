import { ipcMain } from 'electron';
import { importRom } from './romHandlers';


export function registerRomIpc() {
  ipcMain.handle('rom:import', importRom);
}
