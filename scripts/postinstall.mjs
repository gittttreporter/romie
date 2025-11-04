import path from 'path';
import fs from 'fs';
import { platform, arch } from 'os';

// Fixed permissions for 7zip binaries on non-Windows platforms
if (platform() !== 'win32') {
  const platformMap = { darwin: 'mac', linux: 'linux' };
  const platformName = platformMap[platform()] || 'linux';
  const archName = arch();

  const binaryPath = path.join(
    process.cwd(),
    'node_modules/7zip-bin',
    platformName,
    archName,
    '7za'
  );

  if (fs.existsSync(binaryPath)) {
    fs.chmodSync(binaryPath, 0o755);
    console.log(`Fixed permissions for ${binaryPath}`);
  }
}
