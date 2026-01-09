import { app } from 'electron';
import logger from 'electron-log/main';
import { spawn } from 'node:child_process';
import path from 'node:path';

const log = logger.scope('zip-utils');

/**
 * Gets the path to the bundled 7zip binary for the current platform.
 * Used for both creating zips and extracting archives.
 */
export function get7zBinaryPath(): string {
  // Map Node.js platform names to the 7zip-bin directory names
  const platformMap = {
    darwin: 'mac',
    win32: 'win',
  } as Partial<Record<NodeJS.Platform, string>>;

  const platform = platformMap[process.platform] || 'linux';
  const arch = process.arch;
  const basePath = app.isPackaged
    ? process.resourcesPath
    : path.join(process.cwd(), 'node_modules');
  const binaryName = process.platform === 'win32' ? '7za.exe' : '7za';
  const binaryPath = path.join(basePath, '7zip-bin', platform, arch, binaryName);

  log.debug(`Using 7zip binary at: ${binaryPath}`);
  return binaryPath;
}

/**
 * Creates a zip file from a list of files in a working directory.
 * Used for database backups and log exports.
 *
 * @param zipPath - Full path where the zip file should be created
 * @param cwd - Working directory containing the files to zip
 * @param fileNames - Array of filenames (relative to cwd) to include in the zip
 */
export async function createZip(zipPath: string, cwd: string, fileNames: string[]): Promise<void> {
  const SEVEN_ZIP_PATH = get7zBinaryPath();
  log.debug(`Creating zip at ${zipPath} from ${cwd}`);

  await new Promise<void>((resolve, reject) => {
    const child = spawn(SEVEN_ZIP_PATH, ['a', '-tzip', zipPath, ...fileNames], { cwd });

    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const details = stderr.trim();
      reject(new Error(details ? `7zip failed: ${details}` : `7zip failed with exit code ${code}`));
    });
  });
}
