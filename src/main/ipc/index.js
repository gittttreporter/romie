import { registerDarkModeIpc } from './darkMode';
import { registerRomIpc } from './rom';

export function registerAllIpc() {
  registerDarkModeIpc();
  registerRomIpc();
}
