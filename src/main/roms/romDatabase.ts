import fs from "fs/promises";
import path from "path";
import { app } from "electron";
import log from "electron-log/main";
import { JSONFilePreset } from "lowdb/node";
import { fileExists } from "./romUtils";

import type { Low } from "lowdb";
import type { Rom, RomDatabase, RomDatabaseStats } from "@/types/rom";

const baseDir = app.getPath("userData");
const romDir = path.join(baseDir, "roms");
const romDbPath = path.join(baseDir, "roms.json");

const ROM_IMMUTABLE_FIELDS: (keyof Rom)[] = [
  "id",
  "originalFilename",
  "importedAt",
  "md5",
  "sha1",
  "crc32",
];

let database: Low<RomDatabase> | null = null;

async function loadDatabase(): Promise<void> {
  log.info(`Loading ROM database from ${romDbPath}`);
  const now = Date.now();

  database = await JSONFilePreset<RomDatabase>(romDbPath, {
    version: "1.0.0",
    created: now,
    lastUpdated: now,
    stats: { totalRoms: 0, totalSizeBytes: 0, systemCounts: {} },
    roms: [],
  });
  log.info("Database loaded successfully");
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
  };

  roms.forEach((rom) => {
    stats.totalRoms++;
    stats.totalSizeBytes += rom.size;
    stats.systemCounts[rom.system] = (stats.systemCounts[rom.system] ?? 0) + 1;
  });

  return stats;
}

export async function addRom(rom: Rom): Promise<void> {
  const db = await ensureDatabase();
  log.debug(`Adding ROM: ${rom.originalFilename}`);

  // Check for duplicates
  const existing = db.data.roms.find(({ md5 }) => md5 === rom.md5);

  if (existing) {
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
  log.info(`ROM added: ${rom.originalFilename}`);
}

export async function removeRomById(id: string): Promise<void> {
  log.debug(`Removing ROM: ${id}`);
  const db = await ensureDatabase();
  const romIdx = db.data.roms.findIndex((rom) => rom.id === id);

  if (romIdx === -1) throw new Error(`ROM with id ${id} not found`);

  // Extract just the filename to prevent issues with filenames like "../../get/pwn3d/myrom.gg"
  const { originalFilename } = db.data.roms[romIdx];
  const filename = path.basename(originalFilename);
  const storedFilePath = path.join(romDir, filename);

  // Remove the ROM database entry
  log.debug(`Removing ROM metadata: ${id}`);
  await db.update((data) => {
    data.roms.splice(romIdx, 1);
    data.stats = getDatabaseStats(data.roms);
  });

  // Remove the ROM file if we can.
  // TODO: Clean up orphaned rom files during app start.
  try {
    log.debug(`Attempting to delete ROM file at ${storedFilePath}`);
    if (await fileExists(storedFilePath)) {
      await fs.unlink(storedFilePath);
      log.info(`ROM file deleted: ${storedFilePath}`);
    } else {
      log.warn(`ROM file not found for deletion: ${storedFilePath}`);
    }
  } catch (err: any) {
    log.warn(`Failed to delete ROM file (${storedFilePath}): ${err.message}`);
  }
}

export async function updateRom(
  id: string,
  romUpdate: Partial<Rom>,
): Promise<void> {
  log.debug(`Updating ROM: ${id}`);
  const db = await ensureDatabase();
  const romIdx = db.data.roms.findIndex((r) => r.id === id);
  const now = Date.now();

  if (romIdx === -1) throw new Error(`ROM with id ${id} not found`);
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
}

export async function listRoms(): Promise<Rom[]> {
  const db = await ensureDatabase();

  return structuredClone(db.data.roms);
}

export async function getRomStats(): Promise<RomDatabaseStats> {
  const db = await ensureDatabase();

  return db.data.stats;
}
