import { md5 } from "../utils/hash";
import { readAll } from "../utils/files";
import type { RaHashOptions } from "../types";

type N64Layout = "z64" | "v64" | "n64" | "unknown";

/**
 * N64 ROMs come in three common "byte orders" depending on how they were dumped:
 *
 * - `.z64` (big-endian): the standard format RA expects. First 4 bytes = 80 37 12 40.
 * - `.v64` (byteswapped): every pair of bytes is flipped. First 4 bytes = 37 80 40 12.
 * - `.n64` (little-endian): every group of 4 bytes is reversed. First 4 bytes = 40 12 37 80.
 *
 * These all represent the same game data, just stored in different byte orders.
 * To match RetroAchievements, we normalize everything to the `.z64` form
 * before hashing with MD5. That way, no matter how the ROM was dumped,
 * we get the same consistent RA ID.
 */
export async function hashN64({ buffer, path }: RaHashOptions) {
  const rom = buffer ?? (await readAll(path!));
  const layout = detectLayout(rom);
  const normalized = toZ64(rom, layout);
  const ramd5 = md5(normalized);

  let notes: string | undefined;
  if (layout === "v64") notes = "normalized N64 (.v64 → .z64) before hashing";
  else if (layout === "n64")
    notes = "normalized N64 (.n64 → .z64) before hashing";
  else if (layout === "unknown") notes = "layout unknown; hashed as-is";

  return { ramd5, notes };
}

//== Internal helpers ==//

/**
 * Detect N64 ROM byte layout via the first 4 bytes:
 * z64 (big-endian):      80 37 12 40
 * v64 (byte-swapped):    37 80 40 12
 * n64 (little-endian):   40 12 37 80
 */
function detectLayout(buf: Buffer): N64Layout {
  if (buf.length < 4) return "unknown";
  const [b0, b1, b2, b3] = [buf[0], buf[1], buf[2], buf[3]];
  if (b0 === 0x80 && b1 === 0x37 && b2 === 0x12 && b3 === 0x40) return "z64";
  if (b0 === 0x37 && b1 === 0x80 && b2 === 0x40 && b3 === 0x12) return "v64";
  if (b0 === 0x40 && b1 === 0x12 && b2 === 0x37 && b3 === 0x80) return "n64";
  return "unknown";
}

/**
 * Normalize to z64:
 * - v64: swap every 2 bytes
 * - n64: swap every 4 bytes [A B C D] -> [D C B A]
 * - z64/unknown: return original
 */
function toZ64(buf: Buffer, layout: N64Layout): Buffer {
  if (layout === "z64" || layout === "unknown") return buf;

  const out = Buffer.allocUnsafe(buf.length);
  if (layout === "v64") {
    for (let i = 0; i < buf.length; i += 2) {
      out[i] = buf[i + 1];
      out[i + 1] = buf[i];
    }
    return out;
  }
  // layout === "n64"
  for (let i = 0; i < buf.length; i += 4) {
    out[i] = buf[i + 3];
    out[i + 1] = buf[i + 2];
    out[i + 2] = buf[i + 1];
    out[i + 3] = buf[i];
  }
  return out;
}
