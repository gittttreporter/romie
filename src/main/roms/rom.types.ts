export type ConsoleCode =
  | 'gba'
  | 'gb'
  | 'gbc'
  | 'nes'
  | 'snes'
  | 'n64'
  | 'psx'
  | 'genesis'
  | 'gg'
  | 'tg16' // TurboGrafx-16
  | 'sms'  // Sega Master System

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

export interface RomMetadata {
  /** Unique stable ID (e.g., `gba-metroid-fusion-usa`) */
  id: string

  /** Console key (e.g., gba, snes, psx) */
  console: ConsoleCode

  /** Clean display name (e.g., "Metroid Fusion") */
  displayName: string

  /** Region code (e.g., "USA", "JPN", "EUR") */
  region: RegionCode

  /** Actual stored filename on disk */
  filename: string

  /** Original filename before any cleaning */
  originalFilename: string

  /** Relative path to the ROM (e.g., `roms/GBA/Metroid Fusion (USA).gba`) */
  path: string

  /** File size in bytes */
  size: number

  /** ISO 8601 timestamp of when the ROM was added */
  importedAt: string

  /** Freeform tag system for filters, badges, search */
  tags?: string[]

  /** Optional user notes or metadata annotations */
  notes?: string
}
