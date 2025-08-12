// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { updatePreset } from "@primeuix/themes";
import { contextBridge, ipcRenderer, shell } from "electron";

const romApi = {
  list: () => ipcRenderer.invoke("rom:list"),
  remove: (id) => ipcRenderer.invoke("rom:remove", id),
  update: (id, data) => ipcRenderer.invoke("rom:update", id, data),
  import: () => ipcRenderer.invoke("rom:import"),
  stats: () => ipcRenderer.invoke("rom:stats"),
};

const deviceApi = {
  list: () => ipcRenderer.invoke("device:list"),
  listStorage: () => ipcRenderer.invoke("device:listStorage"),
  create: (data) => ipcRenderer.invoke("device:create", data),
  remove: (id) => ipcRenderer.invoke("device:remove", id),
  update: (id, data) => ipcRenderer.invoke("device:update", id, data),
};

contextBridge.exposeInMainWorld("darkMode", {
  onChange: (callback) => {
    ipcRenderer.on("dark-mode:change", (_event, value) => callback(value));
  },
  value: () => ipcRenderer.invoke("dark-mode:value"),
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system"),
});

contextBridge.exposeInMainWorld("rom", romApi);
contextBridge.exposeInMainWorld("device", deviceApi);

contextBridge.exposeInMainWorld("util", {
  openExternalLink: (url) => ipcRenderer.invoke("util:openExternal", url),
});
