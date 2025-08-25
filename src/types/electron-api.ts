import { SyncError } from "@/errors";
import type { Rom, RomDatabaseStats } from "./rom";
import type { Device, StorageDevice } from "@/types/device";

export type RomImportResult = {
  canceled: boolean;
  imported: Rom[];
  failed: {
    file: string;
    reason: string;
  }[];
  totalProcessed: number;
};

export interface ImportStatus {
  currentFile: string;
}

export interface RomApi {
  list(): Promise<Rom[]>;
  remove(id: string): Promise<void>;
  update(id: string, romUpdate: Partial<Rom>): Promise<void>;
  import(): Promise<RomImportResult>;
  scan(): Promise<RomImportResult>;
  stats(): Promise<RomDatabaseStats>;
  onImportProgress(callback: (progress: ImportStatus) => void): () => void;
}

export interface DeviceMountStatus {
  accessible: boolean;
  freeSpace?: string;
  totalSpace?: string;
  freeBytes?: number;
  totalBytes?: number;
}

export interface DeviceApi {
  list(): Promise<Device[]>;
  listStorage(): Promise<StorageDevice[]>;
  create(data: Device): Promise<Device>;
  update(id: string, deviceUpdate: Partial<Device>): Promise<Device>;
  remove(id: string): Promise<void>;
  checkDeviceMount(deviceId: string): Promise<DeviceMountStatus>;
}

export interface SyncOptions {
  cleanDestination: boolean;
  verifyFiles: boolean;
}

/**
 * Real-time status of a sync operation.
 *
 * All files are accounted for: totalFiles = processed + skipped + failed
 */
export interface SyncStatus {
  phase: "idle" | "preparing" | "copying" | "verifying" | "done" | "error";
  currentFile?: string;
  error?: SyncError;
  /** Total files selected for sync */
  totalFiles: number;
  /** Files successfully processed */
  filesProcessed: number;
  /** Progress as percentage (0-100) */
  progressPercent: number;
  /** Files skipped (unsupported format, already exists, etc.) */
  filesSkipped: SyncSkipReason[];
  /** Files that failed to copy or verify */
  filesFailed: SyncFailReason[];
}

export interface SyncWarning {
  rom: Rom;
  message: string;
}

export interface SyncFailReason {
  rom: Rom;
  error: SyncError;
}
export interface SyncSkipReason {
  rom: Rom;
  reason: "unsupported_system" | "unsupported_format" | "file_exists";
  details: string;
}

export interface SyncApi {
  start(
    tagIds: string[],
    deviceId: string,
    options: SyncOptions,
  ): Promise<SyncStatus>;
  cancel(): Promise<void>;
  onProgress(callback: (progress: SyncStatus) => void): () => void;
}
