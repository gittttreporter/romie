import type { RaHashOptions } from "../types";
import { md5 } from "../utils/hash";
import { readAll } from "../utils/files";

/**
 * RetroAchievements NDS hashing:
 * Build a buffer consisting of:
 *  - First 0x160 bytes of the ROM (header)
 *  - Icon/title block (0x840 bytes) at offset from 0x68
 *  - ARM9 binary: size @ 0x2C, offset @ 0x20
 *  - ARM7 binary: size @ 0x3C, offset @ 0x30
 * Then MD5 that buffer.
 */
export async function hashNDS({ buffer, path }: RaHashOptions) {
  const rom = buffer ?? (await readAll(path!));
  if (rom.length < 0x160) {
    throw new Error("File too small to be a valid NDS ROM");
  }

  const parts: Buffer[] = [];

  // 1. First 0x160 bytes (header)
  parts.push(rom.subarray(0, 0x160));

  // 2. Icon/title block
  const iconOffset = rom.readUInt32LE(0x68);
  if (iconOffset > 0 && iconOffset + 0x840 <= rom.length) {
    parts.push(rom.subarray(iconOffset, iconOffset + 0x840));
  }

  // 3. ARM9 binary
  const arm9Offset = rom.readUInt32LE(0x20);
  const arm9Size = rom.readUInt32LE(0x2c);
  if (arm9Offset > 0 && arm9Size > 0 && arm9Offset + arm9Size <= rom.length) {
    parts.push(rom.subarray(arm9Offset, arm9Offset + arm9Size));
  }

  // 4. ARM7 binary
  const arm7Offset = rom.readUInt32LE(0x30);
  const arm7Size = rom.readUInt32LE(0x3c);
  if (arm7Offset > 0 && arm7Size > 0 && arm7Offset + arm7Size <= rom.length) {
    parts.push(rom.subarray(arm7Offset, arm7Offset + arm7Size));
  }

  // Concatenate and hash
  const combined = Buffer.concat(parts);
  return {
    ramd5: md5(combined),
    notes: "NDS RA hash built from header + icon + ARM9 + ARM7",
  };
}
