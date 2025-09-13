import type { SystemCode } from "@/types/system";
import type { Device } from "@/types/device";
import type { AppSettings, AppIntegrations } from "@/types/settings";

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
  filePath: string;

  size: number;
  importedAt: number;
  lastUpdated: number;
  /** MD5 hash of ROM content - primary deduplication method */
  md5: string;
  /** CRC32 of actual file on disk - fast file integrity checking */
  fileCrc32: string;
  /** RetroAchievements hash - required for game identification */
  ramd5: string | null;
  verified: boolean;
  tags?: string[];
  favorite?: boolean;
  notes?: string;

  /** @deprecated Unused import source field, will be removed in future version */
  source?: "import" | "scan";
  /** @deprecated Unused hash field, will be removed in future version */
  crc32?: string;
  /** @deprecated Unused hash field, will be removed in future version */
  sha1?: string;
}

export interface TagStats {
  tag: string;
  romCount: number;
  totalSizeBytes: number;
}

export interface RomDatabaseStats {
  totalRoms: number;
  totalSizeBytes: number;
  systemCounts: Partial<Record<SystemCode, number>>;
  tagStats: Record<string, TagStats>;
}

export interface RomDatabase {
  version: string;
  created: number;
  lastUpdated: number;
  stats: RomDatabaseStats;
  roms: Rom[];
  devices: Device[];
  settings: AppSettings;
  integrations: Partial<AppIntegrations>;
}
