import { ipcMain } from "electron";
import {
  getAppSettings,
  updateAppSettings,
  addRetroAchievementsConfig,
  getRetoroAchievementsConfig,
  removeRetroAchievementsConfig,
} from "@main/roms/romDatabase";
import { AppSettings, RetroAchievementsConfig } from "@/types/settings";

export function registerSettingsIpc() {
  // App settings
  ipcMain.handle("settings:get", (_) => getAppSettings());
  ipcMain.handle("settings:update", (_, settingsUpdate: Partial<AppSettings>) =>
    updateAppSettings(settingsUpdate),
  );

  // RetroAchievements integration
  ipcMain.handle("ra:setConfig", (_, config: RetroAchievementsConfig) =>
    addRetroAchievementsConfig(config),
  );
  ipcMain.handle("ra:getConfig", (_) => getRetoroAchievementsConfig());
  ipcMain.handle("ra:removeConfig", (_) => removeRetroAchievementsConfig());
}
