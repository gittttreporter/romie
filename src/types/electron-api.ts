import type { Rom, RomDatabaseStats } from "./rom";
import type { Device, StorageDevice } from "@/types/device";

export type RomImportResult = {
  canceled: boolean;
  imported: Rom[];
  failed: {
    file: string;
    reason: string;
  }[];
};

export interface RomApi {
  list(): Promise<Rom[]>;
  remove(id: string): Promise<void>;
  update(id: string, romUpdate: Partial<Rom>): Promise<void>;
  import(): Promise<RomImportResult>;
  stats(): Promise<RomDatabaseStats>;
}

export interface DeviceApi {
  list(): Promise<Device[]>;
  listStorage(): Promise<StorageDevice[]>;
  create(data: Device): Promise<Device>;
  update(id: string, deviceUpdate: Partial<Device>): Promise<Device>;
  remove(id: string): Promise<void>;
}
