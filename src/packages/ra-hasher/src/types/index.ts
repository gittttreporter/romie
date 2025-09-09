export interface RaHashOptions {
  consoleId: number; // RA ConsoleID (see consoleIds.ts)
  path?: string; // file path
  buffer?: Buffer; // or in-memory bytes
}

export interface RaHashResult {
  ramd5: string; // RA identifier (MD5 hex)
  impl: "core";
  notes?: string; // e.g., "normalized N64" or "skipped 512B header"
}

export interface RaHasher {
  hash(opts: RaHashOptions): Promise<RaHashResult>;
}
