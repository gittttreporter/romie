import { app } from 'electron';
import logger from 'electron-log/main';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createZip } from '@main/utils/zip.utils';

const log = logger.scope('log-export');

export function getLogDirectory(): string {
  return app.getPath('logs');
}

export async function collectLogFiles(): Promise<string[]> {
  const logDir = getLogDirectory();

  try {
    const entries = await fs.readdir(logDir);
    const logFiles = entries.filter((entry) => entry.endsWith('.log'));
    return logFiles;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      log.warn('Log directory does not exist:', logDir);
      return [];
    }
    throw error;
  }
}

export function generateManifest(): string {
  const now = new Date().toISOString();
  const appVersion = app.getVersion();
  const platform = process.platform;
  const arch = process.arch;
  const electronVersion = process.versions.electron;
  const chromeVersion = process.versions.chrome;
  const nodeVersion = process.versions.node;
  const osType = os.type();
  const osRelease = os.release();
  const osVersion = os.version?.() ?? 'N/A';

  return `ROMie Diagnostics
Generated: ${now}

App Version: ${appVersion}
Platform: ${platform}
Architecture: ${arch}
Electron: ${electronVersion}
Chrome: ${chromeVersion}
Node: ${nodeVersion}

Operating System:
  Type: ${osType}
  Release: ${osRelease}
  Version: ${osVersion}
`;
}

export async function exportLogsToZip(zipPath: string): Promise<void> {
  const tempDir = await fs.mkdtemp(path.join(app.getPath('temp'), 'romie-logs-export-'));
  const logDir = getLogDirectory();

  try {
    // Collect all log files
    const logFiles = await collectLogFiles();

    if (logFiles.length === 0) {
      log.warn('No log files found to export');
    }

    // Copy log files to temp directory
    for (const logFile of logFiles) {
      const sourcePath = path.join(logDir, logFile);
      const destPath = path.join(tempDir, logFile);
      await fs.copyFile(sourcePath, destPath);
    }

    // Generate and write manifest
    const manifestContent = generateManifest();
    const manifestPath = path.join(tempDir, 'manifest.txt');
    await fs.writeFile(manifestPath, manifestContent, 'utf-8');

    // Create zip with all files in temp directory
    const filesToZip = [...logFiles, 'manifest.txt'];
    await createZip(zipPath, tempDir, filesToZip);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
