// src/utils/hash.ts
import { createHash } from "crypto";

export const md5 = (b: Buffer) => createHash("md5").update(b).digest("hex");
export const sha256 = (b: Buffer) =>
  createHash("sha256").update(b).digest("hex");
