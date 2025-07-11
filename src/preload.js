// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system')
})

contextBridge.exposeInMainWorld('rom', {
  import: () => ipcRenderer.invoke('rom:import'),
  // list: () => ipcRenderer.invoke('rom:list'),
  // remove: () => ipcRenderer.invoke('rom:remove')
})
