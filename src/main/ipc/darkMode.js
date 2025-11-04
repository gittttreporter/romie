import { ipcMain } from 'electron';
import { getCurrentTheme, toggleTheme, setSystemTheme } from '@main/themes';

export function registerDarkModeIpc() {
  ipcMain.handle('dark-mode:value', getCurrentTheme);
  ipcMain.handle('dark-mode:toggle', toggleTheme);
  ipcMain.handle('dark-mode:system', setSystemTheme);
}
