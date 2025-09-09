import type { RaHashOptions } from "../types";
import { md5 } from "../utils/hash";

export async function hashArcade({ path }: RaHashOptions) {
  if (!path) {
    throw new Error("Arcade hashing requires a file path");
  }

  // Extract filename without extension (path/galaga.zip -> galaga)
  const filename = path.split("/").pop()?.split("\\").pop() || "";
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

  // Hash the filename string (case-sensitive)
  const nameBuffer = Buffer.from(nameWithoutExt, "utf8");

  return {
    ramd5: md5(nameBuffer),
    notes: `hashed filename: "${nameWithoutExt}"`,
  };
}
