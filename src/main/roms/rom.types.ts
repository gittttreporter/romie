import type { SystemCode } from "@main/systems/system.types"

export type RegionCode =
  | 'USA'
  | 'JPN'
  | 'EUR'
  | 'PAL'
  | 'KOR'
  | 'CHN'
  | 'BRA'
  | 'WORLD'
  | 'OTHER'

export type RomRegion =
  | 'USA'
  | 'Europe'
  | 'Japan'
  | 'World'
  | 'Japan'
  | 'Asia'
  | 'Korea'
  | 'China'
  | 'Australia'
  | 'Brazil'
  | 'Canada'

export interface RomMetadata {
  /** Unique stable ID (e.g., `gba-metroid-fusion-usa`) */
  id: string

  /** System key (e.g., gba, snes, psx) */
  system: SystemCode

  /** Clean display name (e.g., "Metroid Fusion") */
  displayName: string

  /** Region the ROM is from */
  region: RomRegion | 'Unknown'

  /** Actual stored filename on disk */
  filename: string

  /** Original filename before any cleaning */
  originalFilename: string

  /** File size in bytes */
  size: number

  /** ISO 8601 timestamp of when the ROM was added */
  importedAt: string

  /** CRC32 - Primary libretro lookup key (uppercase hex, 8 characters) */
  crc32: string;
  /** MD5 - Secondary libretro verification (uppercase hex, 32 characters) */
  md5: string;
  /** SHA1 - Tertiary libretro verification (uppercase hex, 40 characters) */
  sha1: string

  /** Freeform tag system for filters, badges, search */
  tags?: string[]

  /** Optional user notes or metadata annotations */
  notes?: string
}

export interface RomDatabaseStats {
  totalRoms: number;
  totalSizeBytes: number;
  systemCounts: Record<SystemCode, number> | {};
}

export interface RomDatabase {
  version: string
  created: string
  lastUpdated: string
  stats: RomDatabaseStats
  roms: RomMetadata[]
}
