import type { SystemCode } from "@/types/system";
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

export interface ArtworkConfig {
  enabled: boolean;
  pathPattern: string; // "{romBasePath}/{folderName}/Imgs/"
  supportedFormats: string[]; // [".png", ".jpg"]
  maxWidth?: number;
  maxHeight?: number;
  namingConvention?: "rom_name" | "display_name";
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

export interface DeviceProfile {
  id: string;
  name: string;
  romBasePath: string; // e.g., "/Roms/"
  biosBasePath?: string; // e.g., "/BIOS/"
  artworkConfig?: ArtworkConfig;
  systemMappings: Record<SystemCode, DeviceSystemProfile>;
}

export interface DeviceSystemProfile {
  folderName: string; // e.g., "FC" for NES, "GB" for Game Boy
  supportedFormats: string[]; // e.g., [".nes", ".zip", ".7z"]
  emulators?: string[]; // Available emulator cores
  specialRequirements?: string; // e.g., "ROMs must contain headers"
}

export interface BiosFile {
  filename: string; // e.g., "gba_bios.bin"
  required: boolean; // true if required, false if optional
  description?: string;
}
