import type { RaHashOptions } from '../types';
import { md5 } from '../utils/hash';
import { readAll } from '../utils/files';

const NES_MAGIC = Buffer.from([0x4e, 0x45, 0x53, 0x1a]); // "NES\x1A"

function hasINesHeader(buf: Buffer): boolean {
  return buf.length >= 16 && buf.subarray(0, 4).equals(NES_MAGIC);
}

export async function hashNES({ buffer, path }: RaHashOptions) {
  const rom = buffer ?? (await readAll(path!));

  // RA: if iNES header is present, skip 16 bytes; else hash entire file
  const payload = hasINesHeader(rom) ? rom.subarray(16) : rom;

  return {
    ramd5: md5(payload),
    notes: hasINesHeader(rom) ? 'skipped 16B iNES header' : undefined,
  };
}
