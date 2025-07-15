// romDatabase.ts
import { promises as fs } from 'fs';
import path from 'path';
import { app } from 'electron';
import log from 'electron-log';
import type { RomDatabase, RomMetadata } from './rom.types';

const dbPath = path.join(app.getPath('userData'), 'roms.json');
const tempPath = path.join(app.getPath('userData'), 'roms.json.tmp');
let database: RomDatabase | null = null

export async function loadDatabase(): Promise<void> {
  try {
    log.info('Loading ROM database...');
    const data = await fs.readFile(dbPath, 'utf8');
    database = JSON.parse(data) as RomDatabase;
    log.info('Database loaded successfully');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      log.info('Database file not found, creating new database');

      database = {
        version: '1.0.0',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        stats: { totalRoms: 0, totalSizeBytes: 0, systemCounts: {} },
        roms: []
      };
    } else {
      log.error('Failed to load database:', error);
      throw error;
    }
  }
}

export async function saveDatabase(): Promise<void> {
  if (!database) {
    log.error('Attempted to save database but no database is loaded');
    throw new Error('No database loaded to save');
  }

  log.debug('Starting database save operation');
  database.lastUpdated = new Date().toISOString();

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

export async function addRom(rom: RomMetadata): Promise<void> {
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

  await saveDatabase();
}
