import log from "electron-log";
import si from "systeminformation";
import fs from "fs/promises";
import { addDevice, listDevices as getDevices } from "@main/roms/romDatabase";

import type { Device, StorageDevice } from "@/types/device";
import type { DeviceMountStatus } from "@/types/electron-api";

export async function listDevices(): Promise<Device[]> {
  log.warn("deviceService.listDevices() is not implemented");

  return [];
}

export async function listStorage(): Promise<StorageDevice[]> {
  const [blockDevices, fileSystems] = await Promise.all([
    si.blockDevices(),
    si.fsSize(),
  ]);
  const validDevices: StorageDevice[] = [];

  blockDevices.forEach((device) => {
    const { removable, type } = device;

    if (removable && type === "part") {
      // Accurate size comes from the file system information
      const fs = fileSystems.find(({ fs, size }) => fs === device.name);

      if (fs) {
        validDevices.push({
          ...device,
          size: fs.size,
        });
      }
    }
  });

  return validDevices;
}

export async function createDevice(data: Device): Promise<Device> {
  try {
    return await addDevice(data);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error";

    throw new Error(`Failed to create device: ${reason}`);
  }
}

export async function removeDevice(id: string): Promise<void> {
  log.warn("deviceService.removeDevice() is not implemented");
}

export async function updateDevice(
  id: string,
  data: Partial<Device>,
): Promise<void> {
  log.warn("deviceService.updateDevice() is not implemented");
}

export async function checkDeviceMount(deviceId: string): Promise<DeviceMountStatus> {
  try {
    // Get the device to find its mount path
    const devices = await getDevices();
    const device = devices.find(d => d.id === deviceId);
    
    if (!device || !device.deviceInfo.mount) {
      return { accessible: false };
    }
    
    const mountPath = device.deviceInfo.mount;
    
    // Check if mount path is accessible
    try {
      await fs.access(mountPath);
    } catch {
      return { accessible: false };
    }
    
    // Get storage info for this mount path
    try {
      const fileSystems = await si.fsSize();
      const fsInfo = fileSystems.find(fs => fs.mount === mountPath);
      
      if (fsInfo) {
        const freeGB = (fsInfo.available / (1000 * 1000 * 1000)).toFixed(1);
        const totalGB = (fsInfo.size / (1000 * 1000 * 1000)).toFixed(1);
        
        return {
          accessible: true,
          freeSpace: `${freeGB} GB`,
          totalSpace: `${totalGB} GB`,
          freeBytes: fsInfo.available,
          totalBytes: fsInfo.size,
        };
      }
    } catch (error) {
      log.warn(`Failed to get storage info for ${mountPath}:`, error);
    }
    
    // Mount is accessible but couldn't get storage info
    return { accessible: true };
    
  } catch (error) {
    log.error(`Failed to check device mount for ${deviceId}:`, error);
    return { accessible: false };
  }
}
