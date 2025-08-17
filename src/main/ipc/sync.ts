import { ipcMain, BrowserWindow, app } from "electron";
import log from "electron-log/main";
import { SyncError } from "@/errors";
import type {
  SyncOptions,
  SyncStatus,
  SyncSkipReason,
  SyncFailReason,
} from "@/types/electron-api";
import type { Device } from "@/types/device";
import type { Rom } from "@/types/rom";
import type { DeviceProfile } from "@/types/device";
import fs from "fs/promises";
import path from "path";
import { listDevices } from "../roms/romDatabase";
import { listRoms } from "../roms/romDatabase";
import { getDeviceProfile } from "../../utils/device-profiles";
import { calculateCRC32 } from "../roms/romUtils";

type SyncNotifier = ReturnType<typeof createSyncNotifier>;

let syncCancelled = false;

//=== PUBLIC API ===
export function registerSyncIpc() {
  ipcMain.handle("sync:start", (_, tagIds, deviceId, options) =>
    startSync(tagIds, deviceId, options),
  );
  ipcMain.handle("sync:cancel", cancelSync);
}

//=== HANDLERS ===
async function startSync(
  tagIds: string[],
  deviceId: string,
  options: SyncOptions,
): Promise<SyncStatus> {
  syncCancelled = false;
  const startTime = Date.now();
  const syncStatus = createSyncNotifier();

  log.info(
    `[SYNC] Starting sync operation for device ${deviceId} with tags: ${tagIds.join(", ")}`,
  );
  log.info(
    `[SYNC] Sync options: cleanDestination=${options.cleanDestination}, verifyFiles=${options.verifyFiles}`,
  );

  try {
    // Step 1: Validation
    syncStatus.setPhase("preparing").notify();

    const device = await validateDevice(deviceId);
    const profile = validateProfile(device.profileId);

    // Step 2: Preparation
    if (options.cleanDestination) {
      await cleanDestination(device, profile);
    }

    // Step 3: Get and filter ROMs
    log.debug(`[SYNC] Loading ROM database`);
    const allRoms = await listRoms();
    const filteredRoms = filterRomsForSync(
      allRoms,
      tagIds,
      profile,
      syncStatus,
    );
    syncStatus.setTotal(filteredRoms.length).notify();

    if (filteredRoms.length === 0) {
      log.warn(`[SYNC] No ROMs found matching criteria`);
      syncStatus.setPhase("done").setCurrentFile("").notify();

      return syncStatus.status;
    }

    // Step 4: Copy ROMs
    await copyRoms(filteredRoms, device, profile, options, syncStatus);

    // Complete
    const duration = Date.now() - startTime;
    log.info(
      `[SYNC] Sync completed successfully in ${duration}ms: ${filteredRoms.length} ROMs synced`,
    );

    syncStatus.setPhase("done").setCurrentFile("").notify();
  } catch (error) {
    const duration = Date.now() - startTime;
    const syncError =
      error instanceof SyncError
        ? error
        : new SyncError(
            `Sync failed: ${(error as Error).message}`,
            error as Error,
          );

    log.error(`[SYNC] Sync failed after ${duration}ms: ${syncError.message}`);
    if (syncError.cause) {
      log.error(`[SYNC] Root cause:`, syncError.cause);
    }

    syncStatus.setError(syncError).setCurrentFile("").notify();

    throw syncError;
  }

  return syncStatus.status;
}

function cancelSync() {
  log.info(`[SYNC] Sync cancellation requested`);
  syncCancelled = true;
}

//=== INTERNAL FUNCTIONS ===

async function validateDevice(deviceId: string): Promise<Device> {
  log.debug(`[SYNC] Validating device: ${deviceId}`);

  const devices = await listDevices();
  const device = devices.find((d) => d.id === deviceId);

  if (!device) {
    log.error(`[SYNC] Device not found: ${deviceId}`);
    throw new SyncError(`Device with id ${deviceId} not found`);
  }

  if (!device.deviceInfo.mount) {
    log.error(`[SYNC] Device ${device.name} has no mount path`);
    throw new SyncError(`Device ${device.name} has no mount path`);
  }

  // Check if mount path is accessible
  try {
    await fs.access(device.deviceInfo.mount);
    log.info(
      `[SYNC] Device validated: ${device.name} at ${device.deviceInfo.mount}`,
    );
  } catch (error) {
    log.error(`[SYNC] Mount path not accessible: ${device.deviceInfo.mount}`);
    throw new SyncError(
      `Device mount path ${device.deviceInfo.mount} is not accessible`,
    );
  }

  return device;
}

function validateProfile(profileId: string): DeviceProfile {
  log.debug(`[SYNC] Validating device profile: ${profileId}`);

  const profile = getDeviceProfile(profileId);

  if (!profile) {
    log.error(`[SYNC] Device profile not found: ${profileId}`);
    throw new SyncError(`Device profile ${profileId} not found`);
  }

  log.info(`[SYNC] Using device profile: ${profile.name}`);
  return profile;
}

async function cleanDestination(
  device: Device,
  profile: DeviceProfile,
): Promise<void> {
  const destinationPath = path.join(
    device.deviceInfo.mount,
    profile.romBasePath,
  );

  log.info(`[SYNC] Cleaning destination: ${destinationPath}`);

  try {
    await fs.rm(destinationPath, { recursive: true, force: true });
    log.info(`[SYNC] Destination cleaned successfully`);
  } catch (error) {
    log.error(
      `[SYNC] Failed to clean destination: ${(error as Error).message}`,
    );
    throw new SyncError(
      `Failed to clean destination ${destinationPath}: ${(error as Error).message}`,
    );
  }
}

function filterRomsForSync(
  allRoms: Rom[],
  tagIds: string[],
  profile: DeviceProfile,
  syncStatus: SyncNotifier,
): Rom[] {
  log.debug(
    `[SYNC] Filtering ${allRoms.length} ROMs for tags: ${tagIds.join(", ")}`,
  );

  const filteredRoms = allRoms.filter((rom) => {
    // Check if ROM has any of the target tags
    if (!rom.tags?.some((tag) => tagIds.includes(tag))) {
      return false;
    }

    // Check if system is supported by profile
    const systemMapping = profile.systemMappings[rom.system];
    if (!systemMapping) {
      log.warn(
        `[SYNC] Unsupported system ${rom.system} for ROM: ${rom.displayName}`,
      );
      syncStatus
        .addSkipped({
          rom,
          reason: "unsupported_system",
          details: `System ${rom.system} not supported by profile ${profile.name}`,
        })
        .incrementProcessed();
      return false;
    }

    // Check if file extension is supported
    const extension = path.extname(rom.filename);
    if (!systemMapping.supportedFormats?.includes(extension)) {
      log.warn(
        `[SYNC] Unsupported format ${extension} for ROM: ${rom.displayName}`,
      );
      syncStatus
        .addSkipped({
          rom,
          reason: "unsupported_format",
          details: `Format ${extension} not supported for system ${rom.system}`,
        })
        .incrementProcessed();
      return false;
    }

    return true;
  });

  log.info(`[SYNC] Filtered to ${filteredRoms.length} ROMs for sync`);
  return filteredRoms;
}

async function copyRoms(
  filteredRoms: Rom[],
  device: Device,
  profile: DeviceProfile,
  options: SyncOptions,
  syncStatus: SyncNotifier,
): Promise<void> {
  const baseDir = app.getPath("userData");
  const romDir = path.join(baseDir, "roms");
  syncStatus.setPhase("copying").notify();

  log.info(
    `[SYNC] Starting copy of ${filteredRoms.length} ROMs to ${device.name}`,
  );

  for (let i = 0; i < filteredRoms.length; i++) {
    // TODO: This singleton pattern needs to be removed if we ever support multiple syncs at once
    if (syncCancelled) {
      log.warn(`[SYNC] Sync cancelled at ROM ${i + 1}/${filteredRoms.length}`);
      throw new SyncError("Sync was cancelled");
    }

    const rom = filteredRoms[i];
    const systemMapping = profile.systemMappings[rom.system];
    syncStatus.setCurrentFile(rom.displayName).notify();

    // Build paths
    const sourcePath = path.join(romDir, rom.filename);
    const destinationPath = path.join(
      device.deviceInfo.mount,
      profile.romBasePath,
      systemMapping.folderName,
      rom.filename,
    );

    log.debug(
      `[SYNC] Processing ROM ${i + 1}/${filteredRoms.length}: ${rom.displayName}`,
    );

    // Create destination directory if needed
    const destinationDir = path.dirname(destinationPath);
    await fs.mkdir(destinationDir, { recursive: true });

    // Skip if destination exists
    try {
      await fs.access(destinationPath);
      log.debug(`[SYNC] Skipping existing file: ${rom.filename}`);
      syncStatus
        .addSkipped({
          rom,
          reason: "file_exists",
          details: `File already exists at ${destinationPath}`,
        })
        .incrementProcessed()
        .notify();
      continue; // File already exists, skip
    } catch {
      // File doesn't exist, proceed with copy
    }

    // Copy file
    try {
      log.debug(`[SYNC] Copying: ${sourcePath} -> ${destinationPath}`);
      await fs.copyFile(sourcePath, destinationPath);
      log.debug(`[SYNC] Copy completed: ${rom.filename}`);
    } catch (error) {
      log.error(
        `[SYNC] Copy failed for ${rom.filename}: ${(error as Error).message}`,
      );
      syncStatus
        .addFailed({
          rom,
          error: new SyncError(
            `Failed to copy ${rom.filename}: ${(error as Error).message}`,
          ),
        })
        .incrementProcessed()
        .notify();
      continue;
    }

    // Verify checksum if requested
    if (options.verifyFiles) {
      try {
        log.debug(`[SYNC] Verifying checksum for: ${rom.filename}`);
        const destinationFileBuffer = await fs.readFile(destinationPath);
        const copiedCrc32 = calculateCRC32(destinationFileBuffer);

        if (copiedCrc32 !== rom.crc32) {
          log.error(
            `[SYNC] Checksum mismatch for ${rom.filename}: expected ${rom.crc32}, got ${copiedCrc32}`,
          );

          // Delete the corrupted file
          try {
            await fs.unlink(destinationPath);
            log.debug(`[SYNC] Deleted corrupted file: ${destinationPath}`);
          } catch (deleteError) {
            log.warn(
              `[SYNC] Failed to delete corrupted file: ${(deleteError as Error).message}`,
            );
          }

          // Record as failure and continue
          syncStatus
            .addFailed({
              rom,
              error: new SyncError(
                `Copy verification failed: checksum mismatch`,
              ),
            })
            .incrementProcessed()
            .notify();
          continue;
        }
        log.debug(`[SYNC] Checksum verified for: ${rom.filename}`);
      } catch (error) {
        log.error(
          `[SYNC] Verification failed for ${rom.filename}: ${(error as Error).message}`,
        );

        // Delete the file since we can't verify it
        try {
          await fs.unlink(destinationPath);
          log.debug(`[SYNC] Deleted unverifiable file: ${destinationPath}`);
        } catch (deleteError) {
          log.warn(
            `[SYNC] Failed to delete unverifiable file: ${(deleteError as Error).message}`,
          );
        }

        // Record as failure and continue
        syncStatus
          .addFailed({
            rom,
            error: new SyncError(
              `Failed to verify ${rom.filename}: ${(error as Error).message}`,
            ),
          })
          .incrementProcessed()
          .notify();
        continue;
      }
    }

    // Update progress
    syncStatus.incrementProcessed().notify();
  }

  log.info(
    `[SYNC] Copy completed: ${filteredRoms.length} ROMs synced successfully`,
  );
}

//- utilities

function emitProgress(progress: SyncStatus) {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow?.webContents.send("sync:progress", progress);
}

function createSyncNotifier() {
  const syncStatus: SyncStatus = {
    phase: "idle",
    totalFiles: 0,
    filesProcessed: 0,
    filesFailed: [],
    filesSkipped: [],
    progressPercent: 0,
  };

  function notify() {
    syncStatus.progressPercent =
      syncStatus.totalFiles === 0
        ? 0
        : Math.round((syncStatus.filesProcessed / syncStatus.totalFiles) * 100);
    emitProgress(syncStatus);
  }

  const notifier = {
    notify,
    status: syncStatus,
    setError: (e: SyncError) => {
      syncStatus.error = e;
      return notifier;
    },
    setPhase: (phase: SyncStatus["phase"]) => {
      syncStatus.phase = phase;
      return notifier;
    },
    setTotal: (totalFiles: number) => {
      syncStatus.totalFiles = totalFiles;
      return notifier;
    },
    setCurrentFile: (currentFile: string) => {
      syncStatus.currentFile = currentFile;
      return notifier;
    },
    incrementProcessed: () => {
      syncStatus.filesProcessed++;
      return notifier;
    },
    addSkipped: (reason: SyncSkipReason) => {
      syncStatus.filesSkipped.push(reason);
      return notifier;
    },
    addFailed: (reason: SyncFailReason) => {
      syncStatus.filesFailed.push(reason);
      return notifier;
    },
  };

  return notifier;
}
