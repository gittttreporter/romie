import { ipcMain } from "electron";
import {
  listStorage,
  updateDevice,
  removeDevice,
  checkDeviceMount,
} from "@main/devices/deviceService";

import { listDevices, addDevice } from "@main/roms/romDatabase";

export function registerDeviceIpc() {
  ipcMain.handle("device:list", listDevices);
  ipcMain.handle("device:listStorage", listStorage);
  ipcMain.handle("device:create", (_, data) => addDevice(data));
  ipcMain.handle("device:remove", (_, id) => removeDevice(id));
  ipcMain.handle("device:update", (_, id, data) => updateDevice(id, data));
  ipcMain.handle("device:checkDeviceMount", (_, deviceId) => checkDeviceMount(deviceId));
}
