// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { init } from "@sentry/electron/renderer";
import type {
  RomApi,
  DeviceApi,
  SettingsApi,
  RetroAchievementsApi,
  SyncApi,
  SyncOptions,
  SyncStatus,
  ImportStatus,
} from "@/types/electron-api";
import type { Rom } from "@/types/rom";
import type { Device } from "@/types/device";
import type { AppSettings, RetroAchievementsConfig } from "@/types/settings";
import { SENTRY_DSN } from "./sentry.config";

if (process.env.NODE_ENV !== "development") {
  init({
    dsn: SENTRY_DSN,
    sendDefaultPii: true,
  });
}

const romApi: RomApi = {
  list: () => ipcRenderer.invoke("rom:list"),
  remove: (id: string) => ipcRenderer.invoke("rom:remove", id),
  update: (id: string, data: Partial<Rom>) =>
    ipcRenderer.invoke("rom:update", id, data),
  import: () => ipcRenderer.invoke("rom:import"),
  scan: () => ipcRenderer.invoke("rom:scan"),
  stats: () => ipcRenderer.invoke("rom:stats"),
  onImportProgress: (callback: (progress: ImportStatus) => void) => {
    const handler = (_: any, progress: ImportStatus) => callback(progress);
    ipcRenderer.on("rom:import-progress", handler);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener("rom:import-progress", handler);
    };
  },
};

const deviceApi: DeviceApi = {
  list: () => ipcRenderer.invoke("device:list"),
  listStorage: () => ipcRenderer.invoke("device:listStorage"),
  create: (data: Device) => ipcRenderer.invoke("device:create", data),
  remove: (id: string) => ipcRenderer.invoke("device:remove", id),
  update: (id: string, data: Partial<Device>) =>
    ipcRenderer.invoke("device:update", id, data),
  checkDeviceMount: (deviceId: string) =>
    ipcRenderer.invoke("device:checkDeviceMount", deviceId),
};

const syncApi: SyncApi = {
  start: (tagIds: string[], deviceId: string, options: SyncOptions) =>
    ipcRenderer.invoke("sync:start", tagIds, deviceId, options),
  cancel: () => ipcRenderer.invoke("sync:cancel"),
  onProgress: (callback: (progress: SyncStatus) => void) => {
    const handler = (_: any, progress: SyncStatus) => callback(progress);
    ipcRenderer.on("sync:progress", handler);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener("sync:progress", handler);
    };
  },
};

const settingsApi: SettingsApi = {
  get: () => ipcRenderer.invoke("settings:get"),
  update: (data: Partial<AppSettings>) =>
    ipcRenderer.invoke("settings:update", data),
};

const retroAchievementsApi: RetroAchievementsApi = {
  setConfig: (config: RetroAchievementsConfig) =>
    ipcRenderer.invoke("ra:setConfig", config),
  getConfig: () => ipcRenderer.invoke("ra:getConfig"),
  removeConfig: () => ipcRenderer.invoke("ra:removeConfig"),
  getUserProfile: () => ipcRenderer.invoke("ra:getUserProfile"),
  getGameInfoAndUserProgress: (romHash: string) =>
    ipcRenderer.invoke("ra:getGameInfoAndUserProgress", romHash),
};

interface DarkModeApi {
  onChange: (callback: (value: boolean) => void) => () => void;
  value: () => Promise<boolean>;
  toggle: () => Promise<void>;
  system: () => Promise<void>;
}

interface UtilApi {
  openExternalLink: (url: string) => Promise<void>;
}

const darkModeApi: DarkModeApi = {
  onChange: (callback: (value: boolean) => void) => {
    const handler = (_: any, value: boolean) => callback(value);
    ipcRenderer.on("dark-mode:change", handler);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener("dark-mode:change", handler);
    };
  },
  value: () => ipcRenderer.invoke("dark-mode:value"),
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system"),
};

const utilApi: UtilApi = {
  openExternalLink: (url: string) =>
    ipcRenderer.invoke("util:openExternal", url),
};

contextBridge.exposeInMainWorld("darkMode", darkModeApi);
contextBridge.exposeInMainWorld("rom", romApi);
contextBridge.exposeInMainWorld("device", deviceApi);
contextBridge.exposeInMainWorld("sync", syncApi);
contextBridge.exposeInMainWorld("util", utilApi);
contextBridge.exposeInMainWorld("settings", settingsApi);
contextBridge.exposeInMainWorld("ra", retroAchievementsApi);

// Note: Global Window interface is declared in src/types/electron.d.ts
