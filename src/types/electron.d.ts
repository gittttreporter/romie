import type {
  RomApi,
  DeviceApi,
  SyncApi,
  DarkModeApi,
  UpdateApi,
  UtilApi,
  SettingsApi,
  RetroAchievementsApi,
} from './electron-api';

declare global {
  interface Window {
    rom: RomApi;
    device: DeviceApi;
    sync: SyncApi;
    settings: SettingsApi;
    ra: RetroAchievementsApi;
    darkMode: DarkModeApi;
    util: UtilApi;
    update: UpdateApi;
  }
}
