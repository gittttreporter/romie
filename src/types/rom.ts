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
  source: "import" | "scan";
  size: number;
  importedAt: number;
  lastUpdated: number;
  crc32: string;
  md5: string;
  /* Custom hash for RetroAchievements lookup */
  ramd5: string | null;
  sha1: string;
  verified: boolean;
  tags?: string[];
  favorite?: boolean;
  notes?: string;
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
