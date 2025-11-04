import fs from 'fs/promises';
import path from 'path';
import { app, safeStorage } from 'electron';
import logger from 'electron-log/main';
import * as Sentry from '@sentry/electron/main';
import { JSONFilePreset } from 'lowdb/node';
import { v4 as uuid } from 'uuid';
import { ensureDatabaseSchema } from './romDatabaseMigrations';
import { isSystemCode } from '@/utils/systems';
import { SYSTEM_CODES } from '@/types/system';
import {
  getAllDeviceProfiles,
  type DeviceProfile,
  type DeviceProfileDraft,
} from '@romie/device-profiles';
import { AppError } from '@/errors';

import type { Low } from 'lowdb';
import type { Rom, RomDatabase, RomDatabaseStats } from '@/types/rom';
import type { SystemCode } from '@/types/system';
import type { Device } from '@/types/device';
import type { AppSettings, RetroAchievementsConfig } from '@/types/settings';

const baseDir =
  process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), '.romie')
    : app.getPath('userData');
const romDbPath = path.join(baseDir, 'roms.json');
const log = logger.scope('rom-db');

const ROM_IMMUTABLE_FIELDS: (keyof Rom)[] = [
  'id',
  'filename',
  'romFilename',
  'filePath',
  'size',
  'importedAt',
  'lastUpdated',
  'md5',
  'ramd5',
  'fileCrc32',
];
const DB_VERSION = '6.0.0';

let database: Low<RomDatabase> | null = null;
let loadDatabasePromise: Promise<Low<RomDatabase>> | null = null;

async function loadDatabase(): Promise<void> {
  return await Sentry.startSpan(
    {
      op: 'db.load',
      name: 'Load ROM Database',
    },
    async (span) => {
      const now = Date.now();

      if (!loadDatabasePromise) {
        log.info(`Starting to load database from ${romDbPath}`);
        await fs.mkdir(baseDir, { recursive: true });

        loadDatabasePromise = JSONFilePreset<RomDatabase>(romDbPath, {
          version: DB_VERSION,
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
          profiles: [],
          settings: {
            theme: 'system',
          },
          integrations: {},
        });
        database = await loadDatabasePromise;

        span.setAttributes({
          'db.version': database.data.version,
          'db.roms_count': database.data.roms.length,
          'db.devices_count': database.data.devices.length,
        });

        if (database.data.version !== DB_VERSION) {
          await Sentry.startSpan(
            { op: 'db.migrate', name: `Migrate Database to ${DB_VERSION}` },
            async () => {
              await ensureDatabaseSchema(database!.data);
              await database!.write();
            }
          );
        }
        loadDatabasePromise = null;
        log.info(`Database loaded successfully`);
      } else {
        log.debug(`Load already in progress, awaiting existing operation`);
        await loadDatabasePromise;
        log.info(`Load operation completed`);
      }
    }
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
      op: 'db.rom.add',
      name: 'Add ROM to Database',
      attributes: {
        'rom.system': rom.system,
        'rom.size_mb': Math.round((rom.size / 1024 / 1024) * 100) / 100,
      },
    },
    async (span) => {
      const db = await ensureDatabase();
      log.debug(`Adding ROM: ${rom.filename} (${rom.romFilename})`);

      // Check for duplicates
      const existing = db.data.roms.find(({ md5 }) => md5 === rom.md5);

      // TODO: Turn this into an upsert operation
      // If not exists, add entry
      // If exists, update entry
      if (existing) {
        span.setStatus({ code: 2, message: 'Duplicate ROM' });
        span.setAttributes({
          'rom.duplicate': true,
        });

        log.warn(`Duplicate ROM rejected: ${rom.filename} (matches ${existing.filename})`);
        throw new Error(
          `ROM "${rom.filename}" already exists (duplicate of "${existing.filename}")`
        );
      }

      await db.update((data) => {
        data.roms.push(rom);
        data.stats = getDatabaseStats(data.roms);
      });

      span.setAttributes({
        'rom.duplicate': false,
        'db.total_roms_after': db.data.roms.length,
      });

      log.info(`ROM added: ${rom.filename} (${rom.romFilename})`);
    }
  );
}

export async function removeRomById(id: string): Promise<void> {
  return await Sentry.startSpan(
    {
      op: 'db.rom.remove',
      name: 'Remove ROM from Database',
    },
    async (span) => {
      log.debug(`Removing ROM: ${id}`);
      const db = await ensureDatabase();
      const romIdx = db.data.roms.findIndex((rom) => rom.id === id);

      if (romIdx === -1) {
        span.setStatus({ code: 2, message: 'ROM not found' });
        throw new Error(`ROM with id ${id} not found`);
      }

      const rom = db.data.roms[romIdx];
      span.setAttributes({
        'rom.system': rom.system,
      });

      // Remove the ROM database entry
      log.debug(`Removing ROM metadata: ${id}`);
      await db.update((data) => {
        data.roms.splice(romIdx, 1);
        data.stats = getDatabaseStats(data.roms);
      });

      span.setAttributes({
        'db.total_roms_after': db.data.roms.length,
      });
    }
  );
}

export async function updateRom(id: string, romUpdate: Partial<Rom>): Promise<void> {
  return await Sentry.startSpan(
    {
      op: 'db.rom.update',
      name: 'Update ROM in Database',
      attributes: {
        'rom.update_fields': Object.keys(romUpdate).length,
      },
    },
    async (span) => {
      log.debug(`Updating ROM: ${id}`);
      const db = await ensureDatabase();
      const romIdx = db.data.roms.findIndex((r) => r.id === id);
      const now = Date.now();

      if (romIdx === -1) {
        span.setStatus({ code: 2, message: 'ROM not found' });
        throw new Error(`ROM with id ${id} not found`);
      }

      const rom = db.data.roms[romIdx];
      span.setAttributes({
        'rom.system': rom.system,
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
    }
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
      op: 'db.device.add',
      name: 'Add Device to Database',
      attributes: {
        'device.profile_id': candidate.profileId,
        'device.has_mount': !!candidate.deviceInfo.mount,
        'device.size_gb': candidate.deviceInfo.size
          ? Math.round((candidate.deviceInfo.size / 1024 / 1024 / 1024) * 100) / 100
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
        span.setStatus({ code: 2, message: 'No mount path' });
        throw new Error('No mount path detected.');
      }
      if (!deviceInfo.size || deviceInfo.size <= 0) {
        span.setStatus({ code: 2, message: 'Invalid device size' });
        throw new Error('Invalid device size.');
      }
      if (!profileId) {
        span.setStatus({ code: 2, message: 'Missing device profile' });
        throw new Error('Missing device profile.');
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
        'db.total_devices_after': db.data.devices.length,
      });

      return device;
    }
  );
}

export async function listDeviceProfiles(): Promise<DeviceProfile[]> {
  const db = await ensureDatabase();
  const customProfiles = structuredClone(db.data.profiles);
  const builtInProfiles = getAllDeviceProfiles();

  return [...builtInProfiles, ...customProfiles].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDeviceProfile(id: string): Promise<DeviceProfile | null> {
  log.debug(`Getting device profile: ${id}`);

  const profiles = await listDeviceProfiles();

  return profiles.find((profile) => profile.id === id) || null;
}

export async function addDeviceProfile(candidate: DeviceProfileDraft): Promise<DeviceProfile> {
  const db = await ensureDatabase();
  const now = Date.now();
  log.debug(`Adding device profile: ${candidate.name}`);

  // Validate custom device profile.
  //
  // Required: name, romBasePath, systemMappings
  if (!candidate.name || !candidate.romBasePath || !candidate.systemMappings) {
    throw AppError.simple('Profile name and ROM base path are required');
  }
  // System systemMappings must have at least one entry
  // and each entry must have folderName and supportedFormats
  // and the key should be a valid system code
  if (Object.keys(candidate.systemMappings).length === 0) {
    throw AppError.simple('At least one system mapping is required');
  }
  // Each entry must use a valid system code and include a folderName and at least one
  // supported file extension.
  Object.entries(candidate.systemMappings).forEach(([key, systemMapping]) => {
    const systemCode = key as SystemCode;

    if (!isSystemCode(systemCode)) {
      const validCodes = SYSTEM_CODES.join(', ');
      throw AppError.simple(`Invalid system code: "${systemCode}". Valid codes are: ${validCodes}`);
    }
    if (!systemMapping.folderName) {
      throw AppError.simple(`Missing folderName for system: ${systemCode}`);
    }
    if (!systemMapping.supportedFormats?.length) {
      throw AppError.simple(
        `At least one file extension is required in supportedFormats for system: ${systemCode}`
      );
    }
  });
  // Device profile must have a unique name to avoid confusion in list views.
  const nameExists = db.data.profiles.some(
    (profile) => profile.name.toLowerCase() === candidate.name.toLowerCase()
  );
  if (nameExists) {
    throw AppError.simple(
      `A device profile named "${candidate.name}" already exists. Please choose a different name.`
    );
  }

  const profile: DeviceProfile = {
    ...candidate,
    isBuiltIn: false,
    createdAt: now,
    lastModified: now,
    version: 1,
    id: uuid(),
  };

  await db.update((data) => {
    data.profiles.push(profile);
    data.lastUpdated = now;
  });

  return profile;
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

export async function addRetroAchievementsConfig(config: RetroAchievementsConfig) {
  const { username, apiKey } = config;

  // Validate params
  if (!username || !apiKey) {
    throw new Error('Both username and API key are required');
  }
  // Validate api is not not obviously wrong
  if (!apiKey.trim() || apiKey.includes(' ') || apiKey.length < 10) {
    throw new Error('API key format appears invalid');
  }
  // Check if encryption is available on this system
  if (!safeStorage.isEncryptionAvailable()) {
    log.error('Secure storage not available on this system');
    throw new Error(
      'Secure storage is not available. Please ensure your system supports encryption.'
    );
  }

  // Encrypt the API key before storing
  let encryptedApiKey: Buffer;
  try {
    encryptedApiKey = safeStorage.encryptString(apiKey);
  } catch (error) {
    log.error('Failed to encrypt API key:', error);
    throw new Error('Failed to encrypt API key for secure storage');
  }

  const db = await ensureDatabase();
  const now = Date.now();

  await db.update((data) => {
    data.integrations.retroachievements = {
      username,
      apiKey: encryptedApiKey.toString('base64'),
    };
    data.lastUpdated = now;
  });
}

export async function getRetoroAchievementsConfig(): Promise<RetroAchievementsConfig | null> {
  const db = await ensureDatabase();
  const { retroachievements } = db.data.integrations;

  if (!retroachievements) {
    return null;
  }

  // Decrypt the API key
  let decryptedApiKey: string;
  try {
    const encryptedBuffer = Buffer.from(retroachievements.apiKey, 'base64');
    decryptedApiKey = safeStorage.decryptString(encryptedBuffer);
  } catch (error) {
    log.error('Failed to decrypt API key:', error);
    throw new Error('Failed to decrypt stored API key');
  }

  return {
    username: retroachievements.username,
    apiKey: decryptedApiKey,
  };
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
