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

export interface SyncOptions {
  cleanDestination: boolean;
  verifyFiles: boolean;
}

export interface SyncProgress {
  phase: 'preparing' | 'syncing' | 'verifying' | 'done' | 'error';
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  progressPercent: number;
}

export interface SyncApi {
  start(tagIds: string[], deviceId: string, options: SyncOptions): Promise<void>;
  cancel(): Promise<void>;
  onProgress(callback: (progress: SyncProgress) => void): () => void;
}
