// src/utils/files.ts
import fs from 'fs/promises';

export async function readAll(p: string) {
  return fs.readFile(p);
}
