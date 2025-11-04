import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { v4 as uuid } from 'uuid';
import log from 'electron-log/main';

const whoAmIPath = path.join(app.getPath('userData'), 'whoami');
let cachedId: string | null = null;

export async function getInstanceId(): Promise<string> {
  if (cachedId) {
    return cachedId;
  }

  try {
    const fileContent = (await fs.readFile(whoAmIPath, 'utf8')).trim();
    // Basic validation: must be a UUID format
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fileContent)) {
      cachedId = fileContent;
      log.debug('[ANALYTICS] Loaded existing instance ID');
    } else {
      log.warn('[ANALYTICS] Invalid instance ID format, generating new one');
      throw new Error('Invalid UUID format');
    }
  } catch {
    cachedId = uuid();
    try {
      await fs.writeFile(whoAmIPath, cachedId);
      log.info('[ANALYTICS] Created new instance ID');
    } catch (error) {
      log.error('[ANALYTICS] Failed to save instance ID:', error);
    }
  }

  return cachedId;
}

export async function resetInstanceId(): Promise<string> {
  log.info('[ANALYTICS] Resetting instance ID');
  cachedId = null;

  try {
    await fs.unlink(whoAmIPath);
  } catch (error) {
    log.warn('[ANALYTICS] Failed to delete whoami file:', error);
  }

  return await getInstanceId();
}
