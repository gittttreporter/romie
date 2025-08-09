// import type { Systeminformation } from "systeminformation";

/**
 * Represents a storage device on the system (E.g. SD card, USB drive, etc).
 */
export interface StorageDevice {
  type: string;
  fsType: string;
  mount: string;
  size: number;
  uuid: string;
  label: string;
  removable: boolean;
  protocol: string;
}

/**
 * Represents a device chosen for ROM synchronization in ROMie.
 */
export interface Device {
  id?: string;
  name: string;
  profileId: string;
  manifestRelPath?: string;
  deviceInfo: StorageDevice;
  tags?: string[];
  addedAt?: number;
  lastSeenAt?: number;
  lastSyncedAt?: number;
}

/**
 * Represents a detected candidate device that may be chosen for ROM syncing.
 *
 * This is an ephemeral object closely related to `Systeminformation.BlockDevicesData` but
 * includes additional fields and warnings for device suitability.
 */
export interface DeviceCandidate {
  type: string;
  fsType: string;
  mount: string;
  size: number;
  uuid: string;
  label: string;
  removable: boolean;
  protocol: string;
  warnings: string[];
}
