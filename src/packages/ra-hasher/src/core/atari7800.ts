import type { RaHashOptions } from "../types";
import { md5 } from "../utils/hash";
import { readAll } from "../utils/files";

export async function hashAtari7800({ buffer, path }: RaHashOptions) {
  const rom = buffer ?? (await readAll(path!));
  const skipHeader = hasAtari7800Header(rom) && rom.length > 128;
  const payload = skipHeader ? rom.subarray(128) : rom;

  return {
    ramd5: md5(payload),
    notes: skipHeader ? "skipped 128B Atari 7800 header" : undefined,
  };
}

/**
 * Atari 7800 dumps sometimes include a 128-byte header added by old tools.
 * The header usually starts with 0x01 followed by the ASCII string "ATARI7800".
 * RA expects us to skip this header if it's present and hash the rest.
 */
function hasAtari7800Header(buf: Buffer): boolean {
  if (buf.length < 10) return false;
  const ascii = buf.subarray(0, 10).toString("ascii");

  return ascii === "\x01ATARI7800";
}
