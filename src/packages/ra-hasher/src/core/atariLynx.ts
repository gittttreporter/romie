import type { RaHashOptions } from '../types';
import { md5 } from '../utils/hash';
import { readAll } from '../utils/files';

export async function hashAtariLynx({ buffer, path }: RaHashOptions) {
  const rom = buffer ?? (await readAll(path!));
  const skipHeader = hasLynxHeader(rom) && rom.length > 64;
  const payload = skipHeader ? rom.subarray(64) : rom;

  return {
    ramd5: md5(payload),
    notes: skipHeader ? 'skipped 64B Atari Lynx header' : undefined,
  };
}

/**
 * Atari Lynx dumps often include a 64-byte header.
 * These headers start with the ASCII string "LYNX".
 * RA expects us to skip the header if present and hash the rest.
 */
function hasLynxHeader(buf: Buffer): boolean {
  return buf.length >= 4 && buf.subarray(0, 4).toString('ascii') === 'LYNX';
}
