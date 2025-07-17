// romDatabase.ts
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import log from 'electron-log/main';
import { fileExists } from './romUtils';
import type { RomDatabase, Rom, RomDatabaseStats } from '@/types/rom';
import type { SystemCode } from '@/types/system';

const romPath = path.join(app.getPath('userData'), 'roms');
const dbPath = path.join(app.getPath('userData'), 'roms.json');
const tempPath = path.join(app.getPath('userData'), 'roms.json.tmp');
let database: RomDatabase | null = null

export async function loadDatabase(): Promise<void> {
  try {
    log.info('Loading ROM database...');
    const data = await fs.readFile(dbPath, 'utf8');
    database = JSON.parse(data) as RomDatabase;
    database.stats = getDatabaseStats(database.roms)
    log.info('Database loaded successfully');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      log.info('Database file not found, creating new database');

      database = {
        version: '1.0.0',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        stats: { totalRoms: 0, totalSizeBytes: 0, systemCounts: {} as Record<SystemCode, number> },
        roms: []
      };
    } else {
      log.error('Failed to load database:', error);
      throw error;
    }
  }
}

export function getDatabaseStats(roms: Rom[]): RomDatabaseStats {
  const stats: RomDatabaseStats = {
    totalRoms: 0,
    totalSizeBytes: 0,
    systemCounts: {} as Record<SystemCode, number>,
  }

  roms.forEach((rom) => {
    stats.totalRoms++
    stats.totalSizeBytes += rom.size
    stats.systemCounts[rom.system] = (stats.systemCounts[rom.system] ?? 0) + 1
  })

  return stats
}

export async function saveDatabase(): Promise<void> {
  if (!database) {
    log.error('Attempted to save database but no database is loaded');
    throw new Error('No database loaded to save');
  }

  log.debug('Starting database save operation');
  database.lastUpdated = new Date().toISOString();
  database.stats = getDatabaseStats(database.roms)

  const dataToSave = JSON.stringify(database, null, 2);
  log.debug(`Serialized database: ${dataToSave.length} characters`);

  try {
    log.debug('Writing to temporary file:', tempPath);
    await fs.writeFile(tempPath, dataToSave, 'utf8');

    log.debug('Atomically renaming temporary file to main database file');
    await fs.rename(tempPath, dbPath);

    log.info('Database saved successfully');
  } catch (error) {
    log.error('Failed to save database:', error);

    try {
      log.debug('Cleaning up temporary file');
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      log.warn('Failed to clean up temporary file:', cleanupError);
    }

    throw error;
  }
}

export async function addRom(rom: Rom): Promise<void> {
  if (!database) {
    log.error('Attempted to add ROM but no database is loaded');
    throw new Error('No database loaded');
  }

  log.debug(`Adding ROM: ${rom.originalFilename}`);

  // Check for duplicates
  const existing = database.roms.find(({ md5 }) => md5 === rom.md5);

  if (existing) {
    log.warn(`Duplicate ROM rejected: ${rom.originalFilename} (matches ${existing.originalFilename})`);
    throw new Error(`ROM "${rom.originalFilename}" already exists (duplicate of "${existing.originalFilename}")`);
  }

  database.roms.push(rom);
  log.info(`ROM added: ${rom.originalFilename}`);

  // TODO: There's an issue here with lock file contention when bulk importing.
  await saveDatabase();
}

export async function removeRomById(id: string): Promise<void> {
  if (!database) {
    log.error(`Attempted to remove ROM but no database is loaded: ${id}`);
    throw new Error('No database loaded');
  }

  log.debug(`Removing ROM: ${id}`)
  const romIdx = database.roms.findIndex((rom) => rom.id === id)

  if (romIdx === -1) throw new Error(`ROM with id ${id} not found`)
  const { originalFilename } = database.roms[romIdx]
  const storedFilePath = path.join(romPath, originalFilename)

  // Remove the ROM database entry
  log.debug(`Removing ROM metadata: ${id}`)
  database.roms.splice(romIdx, 1)
  await saveDatabase()

  // Remove the ROM file if we can.
  // TODO: Clean up orphaned rom files during app start.
  try {
    log.debug(`Attempting to delete ROM file at ${storedFilePath}`)
    if (await fileExists(storedFilePath)) {
      await fs.unlink(storedFilePath)
      log.info(`ROM file deleted: ${storedFilePath}`)
    } else {
      log.warn(`ROM file not found for deletion: ${storedFilePath}`)
    }
  } catch (err: any) {
    log.warn(`Failed to delete ROM file (${storedFilePath}): ${err.message}`)
  }
}

export async function listRoms(): Promise<Rom[]> {
  if (!database) {
    log.error('Attempted to list ROMs but no database is loaded');
    throw new Error('No database loaded');
  }

  return database.roms;
}
