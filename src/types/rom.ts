import type { SystemCode } from "@/types/system";

export type RegionCode =
  | "USA"
  | "JPN"
  | "EUR"
  | "PAL"
  | "KOR"
  | "CHN"
  | "BRA"
  | "WORLD"
  | "OTHER";

export type RomRegion =
  | "USA"
  | "Europe"
  | "Japan"
  | "World"
  | "Asia"
  | "Korea"
  | "China"
  | "Australia"
  | "Brazil"
  | "Canada";

export interface Rom {
  id: string;
  system: SystemCode;
  displayName: string;
  region: RomRegion | "Unknown";
  filename: string;
  originalFilename: string;
  size: number;
  importedAt: number;
  lastUpdated: number;
  crc32: string;
  md5: string;
  sha1: string;
  tags?: string[];
  favorite?: boolean;
  notes?: string;
}

export interface RomDatabaseStats {
  totalRoms: number;
  totalSizeBytes: number;
  systemCounts: Partial<Record<SystemCode, number>>;
}

export interface RomDatabase {
  version: string;
  created: number;
  lastUpdated: number;
  stats: RomDatabaseStats;
  roms: Rom[];
}
