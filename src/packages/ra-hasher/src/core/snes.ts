import { md5 } from "../utils/hash";
import { readAll } from "../utils/files";
import type { RaHashOptions } from "../types";

export async function hashSNES({ buffer, path }: RaHashOptions) {
  const rom = buffer ?? (await readAll(path!));
  const hasHeader = rom.length % 1024 === 512;
  const payload = hasHeader ? rom.subarray(512) : rom;

  return {
    ramd5: md5(payload),
    notes: hasHeader ? "skipped 512B header" : undefined,
  };
}
