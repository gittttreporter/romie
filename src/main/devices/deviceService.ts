import log from "electron-log";
import si from "systeminformation";
import { addDevice } from "@main/roms/romDatabase";

import type { Device, StorageDevice } from "@/types/device";

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
