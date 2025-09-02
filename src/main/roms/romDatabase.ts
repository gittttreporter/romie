import fs from "fs/promises";
import path from "path";
import { app } from "electron";
import log from "electron-log/main";
import * as Sentry from "@sentry/electron/main";
import { JSONFilePreset } from "lowdb/node";
import { v4 as uuid } from "uuid";
import { fileExists } from "./romUtils";

import type { Low } from "lowdb";
import type { Rom, RomDatabase, RomDatabaseStats, TagStats } from "@/types/rom";
import type { Device } from "@/types/device";
import type { AppSettings, RetroAchievementsConfig } from "@/types/settings";

const baseDir = app.getPath("userData");
const romDir = path.join(baseDir, "roms");
const romDbPath = path.join(baseDir, "roms.json");

const ROM_IMMUTABLE_FIELDS: (keyof Rom)[] = [
  "id",
  "originalFilename",
  "importedAt",
  "lastUpdated",
  "md5",
  "sha1",
  "crc32",
];

let database: Low<RomDatabase> | null = null;
let loadDatabasePromise: Promise<Low<RomDatabase>> | null = null;

async function loadDatabase(): Promise<void> {
  return await Sentry.startSpan(
    {
      op: "db.load",
      name: "Load ROM Database",
    },
    async (span) => {
      const now = Date.now();

      if (!loadDatabasePromise) {
        log.info(`[ROM DB] Starting to load database from ${romDbPath}`);

        loadDatabasePromise = JSONFilePreset<RomDatabase>(romDbPath, {
          version: "3.0.0",
          created: now,
          lastUpdated: now,
          stats: {
            totalRoms: 0,
            totalSizeBytes: 0,
            systemCounts: {},
            tagStats: {},
          },
          roms: [],
          devices: [],
          settings: {
            theme: "system",
          },
          integrations: {},
        });
        database = await loadDatabasePromise;

        span.setAttributes({
          "db.version": database.data.version,
          "db.roms_count": database.data.roms.length,
          "db.devices_count": database.data.devices.length,
        });

        // TODO: Implement better migration strategy
        if (database.data.version === "1.0.0") {
          log.info(`[ROM DB] Migrating database from version 1.0.0 to 2.0.0`);

          await Sentry.startSpan(
            { op: "db.migrate", name: "Migrate Database to v2.0.0" },
            async () => {
              await database!.update((data) => {
                data.version = "2.0.0";
                data.lastUpdated = now;
                data.roms.forEach((rom) => {
                  rom.source ??= "import";
                  rom.lastUpdated = now;
                });
              });
            },
          );
        }
        loadDatabasePromise = null;
        log.info(`[ROM DB] Database loaded successfully`);
      } else {
        log.debug(
          `[ROM DB] Load already in progress, awaiting existing operation`,
        );
        await loadDatabasePromise;
        log.info(`[ROM DB] Load operation completed`);
      }
    },
  );
}

async function ensureDatabase(): Promise<Low<RomDatabase>> {
  if (!database) {
    await loadDatabase();
  }
  return database!;
}

function getDatabaseStats(roms: Rom[]): RomDatabaseStats {
  const stats: RomDatabaseStats = {
    totalRoms: 0,
    totalSizeBytes: 0,
    systemCounts: {},
    tagStats: {},
  };

  // Aggregate ROM stats
  roms.forEach((rom) => {
    stats.totalRoms++;
    stats.totalSizeBytes += rom.size;
    stats.systemCounts[rom.system] = (stats.systemCounts[rom.system] ?? 0) + 1;

    // Aggregate tag stats
    if (rom.tags?.length) {
      rom.tags.forEach((tag) => {
        // Since tags are provided by the user, include a prefix to prevent prototype pollution
        // and reserved word conflicts
        const safeKey = `tag:${tag}`;

        if (!stats.tagStats[safeKey]) {
          stats.tagStats[safeKey] = {
            tag,
            romCount: 0,
            totalSizeBytes: 0,
          };
        }
        stats.tagStats[safeKey].romCount++;
        stats.tagStats[safeKey].totalSizeBytes += rom.size;
      });
    }
  });

  return stats;
}

export async function addRom(rom: Rom): Promise<void> {
  return await Sentry.startSpan(
    {
      op: "db.rom.add",
      name: "Add ROM to Database",
      attributes: {
        "rom.system": rom.system,
        "rom.size_mb": Math.round((rom.size / 1024 / 1024) * 100) / 100,
        "rom.source": rom.source,
      },
    },
    async (span) => {
      const db = await ensureDatabase();
      log.debug(`Adding ROM: ${rom.originalFilename}`);

      // Check for duplicates
      const existing = db.data.roms.find(({ md5 }) => md5 === rom.md5);

      // TODO: Turn this into an upsert operation
      // If not exists, add entry
      // If exists, update entry
      if (existing) {
        span.setStatus({ code: 2, message: "Duplicate ROM" });
        span.setAttributes({
          "rom.duplicate": true,
        });

        log.warn(
          `Duplicate ROM rejected: ${rom.originalFilename} (matches ${existing.originalFilename})`,
        );
        throw new Error(
          `ROM "${rom.originalFilename}" already exists (duplicate of "${existing.originalFilename}")`,
        );
      }

      await db.update((data) => {
        data.roms.push(rom);
        data.stats = getDatabaseStats(data.roms);
      });

      span.setAttributes({
        "rom.duplicate": false,
        "db.total_roms_after": db.data.roms.length,
      });

      log.info(`ROM added: ${rom.originalFilename}`);
    },
  );
}

export async function removeRomById(id: string): Promise<void> {
  return await Sentry.startSpan(
    {
      op: "db.rom.remove",
      name: "Remove ROM from Database",
    },
    async (span) => {
      log.debug(`Removing ROM: ${id}`);
      const db = await ensureDatabase();
      const romIdx = db.data.roms.findIndex((rom) => rom.id === id);

      if (romIdx === -1) {
        span.setStatus({ code: 2, message: "ROM not found" });
        throw new Error(`ROM with id ${id} not found`);
      }

      const rom = db.data.roms[romIdx];
      span.setAttributes({
        "rom.system": rom.system,
        "rom.source": rom.source,
      });

      // Extract just the filename to prevent issues with filenames like "../../get/pwn3d/myrom.gg"
      const { originalFilename } = rom;
      const filename = path.basename(originalFilename);
      const storedFilePath = path.join(romDir, filename);

      // Remove the ROM database entry
      log.debug(`Removing ROM metadata: ${id}`);
      await db.update((data) => {
        data.roms.splice(romIdx, 1);
        data.stats = getDatabaseStats(data.roms);
      });

      span.setAttributes({
        "db.total_roms_after": db.data.roms.length,
      });

      // Remove the ROM file if we can.
      // TODO: Clean up orphaned rom files during app start.
      try {
        log.debug(`Attempting to delete ROM file at ${storedFilePath}`);
        if (await fileExists(storedFilePath)) {
          await fs.unlink(storedFilePath);
          span.setAttributes({ "file.deleted": true });
          log.info(`ROM file deleted: ${storedFilePath}`);
        } else {
          span.setAttributes({ "file.deleted": false, "file.not_found": true });
          log.warn(`ROM file not found for deletion: ${storedFilePath}`);
        }
      } catch (err: any) {
        span.recordException(err);
        span.setAttributes({
          "file.deleted": false,
          "file.delete_error": true,
        });
        log.warn(
          `Failed to delete ROM file (${storedFilePath}): ${err.message}`,
        );
      }
    },
  );
}

export async function updateRom(
  id: string,
  romUpdate: Partial<Rom>,
): Promise<void> {
  return await Sentry.startSpan(
    {
      op: "db.rom.update",
      name: "Update ROM in Database",
      attributes: {
        "rom.update_fields": Object.keys(romUpdate).length,
      },
    },
    async (span) => {
      log.debug(`Updating ROM: ${id}`);
      const db = await ensureDatabase();
      const romIdx = db.data.roms.findIndex((r) => r.id === id);
      const now = Date.now();

      if (romIdx === -1) {
        span.setStatus({ code: 2, message: "ROM not found" });
        throw new Error(`ROM with id ${id} not found`);
      }

      const rom = db.data.roms[romIdx];
      span.setAttributes({
        "rom.system": rom.system,
        "rom.source": rom.source,
      });

      ROM_IMMUTABLE_FIELDS.forEach((key) => delete romUpdate[key]);

      await db.update((data) => {
        data.roms[romIdx] = {
          ...data.roms[romIdx],
          ...romUpdate,
          lastUpdated: now,
        };
        data.stats = getDatabaseStats(data.roms);
        data.lastUpdated = now;
      });
    },
  );
}

export async function listRoms(): Promise<Rom[]> {
  const db = await ensureDatabase();

  return structuredClone(db.data.roms);
}

export async function getRomStats(): Promise<RomDatabaseStats> {
  const db = await ensureDatabase();

  return db.data.stats;
}

// = DEVICES ==
// TODO: This is starting to beyond roms so it should be refactored.
export async function addDevice(candidate: Device): Promise<Device> {
  return await Sentry.startSpan(
    {
      op: "db.device.add",
      name: "Add Device to Database",
      attributes: {
        "device.profile_id": candidate.profileId,
        "device.has_mount": !!candidate.deviceInfo.mount,
        "device.size_gb": candidate.deviceInfo.size
          ? Math.round((candidate.deviceInfo.size / 1024 / 1024 / 1024) * 100) /
            100
          : 0,
      },
    },
    async (span) => {
      const { name, profileId, deviceInfo } = candidate;
      log.debug(`Adding device: ${name}`);
      const db = await ensureDatabase();
      const now = Date.now();

      // Validate device info
      if (!deviceInfo.mount) {
        span.setStatus({ code: 2, message: "No mount path" });
        throw new Error("No mount path detected.");
      }
      if (!deviceInfo.size || deviceInfo.size <= 0) {
        span.setStatus({ code: 2, message: "Invalid device size" });
        throw new Error("Invalid device size.");
      }
      if (!profileId) {
        span.setStatus({ code: 2, message: "Missing device profile" });
        throw new Error("Missing device profile.");
      }

      const device: Device = {
        ...candidate,
        id: uuid(),
        addedAt: now,
      };

      await db.update((data) => {
        data.devices.push(device);
        data.lastUpdated = now;
      });

      span.setAttributes({
        "db.total_devices_after": db.data.devices.length,
      });

      return device;
    },
  );
}

export async function listDevices(): Promise<Device[]> {
  const db = await ensureDatabase();

  return structuredClone(db.data.devices);
}

//= User settings =
export async function getAppSettings() {
  const db = await ensureDatabase();

  return structuredClone(db.data.settings);
}

export async function updateAppSettings(settingsUpdate: Partial<AppSettings>) {
  const db = await ensureDatabase();
  const now = Date.now();

  await db.update((data) => {
    data.settings = {
      ...data.settings,
      ...settingsUpdate,
    };
    data.lastUpdated = now;
  });
}

//= Integrations =

export async function addRetroAchievementsConfig(
  config: RetroAchievementsConfig,
) {
  const { username, apiKey } = config;

  // Validate params
  if (!username || !apiKey) {
    throw new Error("Both username and API key are required");
  }
  // Validate api key format
  if (!/^[a-zA-Z0-9]{32}$/.test(config.apiKey)) {
    throw new Error("Invalid API key format");
  }

  // Store the api key in OS keychain
  // TODO: Implement keychain storage

  const db = await ensureDatabase();
  const now = Date.now();

  await db.update((data) => {
    data.integrations.retroachievements = { username, apiKey };
    data.lastUpdated = now;
  });
}

export async function getRetoroAchievementsConfig(): Promise<RetroAchievementsConfig | null> {
  const db = await ensureDatabase();
  const { retroachievements } = db.data.integrations;

  return retroachievements ? structuredClone(retroachievements) : null;
}

export async function removeRetroAchievementsConfig() {
  const db = await ensureDatabase();
  const now = Date.now();

  await db.update((data) => {
    if (data.integrations.retroachievements) {
      delete data.integrations.retroachievements;
    }
    data.lastUpdated = now;
  });
}
