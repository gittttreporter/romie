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

export interface BiosFile {
  filename: string; // e.g., "gba_bios.bin"
  required: boolean; // true if required, false if optional
  description?: string;
}
