import type { SystemCode, SystemInfo } from "../../types/system";

const COMMON_ARCHIVE_FORMATS = [".zip", ".7z"];

export const SYSTEM_REGISTRY: Record<SystemCode, SystemInfo> = {
  // === NINTENDO CONSOLES ===
  nes: {
    code: "nes",
    displayName: "Nintendo Entertainment System",
    type: "console",
    extensions: [".nes", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: false,
    manufacturer: "Nintendo",
    releaseYear: 1985,
  },
  snes: {
    code: "snes",
    displayName: "Super Nintendo Entertainment System",
    type: "console",
    extensions: [".sfc", ".snes", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: false,
    manufacturer: "Nintendo",
    releaseYear: 1990,
  },
  n64: {
    code: "n64",
    displayName: "Nintendo 64",
    type: "console",
    extensions: [".n64", ".v64", ".z64", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: false,
    manufacturer: "Nintendo",
    releaseYear: 1996,
  },

  // === NINTENDO HANDHELDS ===
  gb: {
    code: "gb",
    displayName: "Game Boy",
    type: "handheld",
    extensions: [".gb", ".gbc", ".dmg", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: false,
    manufacturer: "Nintendo",
    releaseYear: 1989,
  },
  gbc: {
    code: "gbc",
    displayName: "Game Boy Color",
    type: "handheld",
    extensions: [".gbc", ".gb", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: false,
    manufacturer: "Nintendo",
    releaseYear: 1998,
  },
  gba: {
    code: "gba",
    displayName: "Game Boy Advance",
    type: "handheld",
    extensions: [".gba", ".bin", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: true,
    biosFiles: ["gba_bios.bin"],
    manufacturer: "Nintendo",
    releaseYear: 2001,
  },

  // === SEGA CONSOLES ===
  genesis: {
    code: "genesis",
    displayName: "Sega Genesis",
    type: "console",
    extensions: [".md", ".gen", ".smd", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: false,
    manufacturer: "Sega",
    releaseYear: 1988,
  },
  sms: {
    code: "sms",
    displayName: "Sega Master System",
    type: "console",
    extensions: [".sms", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: false,
    manufacturer: "Sega",
    releaseYear: 1986,
  },
  gg: {
    code: "gg",
    displayName: "Sega Game Gear",
    type: "handheld",
    extensions: [".gg", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: false,
    manufacturer: "Sega",
    releaseYear: 1990,
  },

  // === SONY ===
  psx: {
    code: "psx",
    displayName: "Sony PlayStation",
    type: "console",
    extensions: [".cue", ".iso", ".chd", ".pbp", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: true,
    biosFiles: ["scph1001.bin", "scph7001.bin", "scph5501.bin"],
    manufacturer: "Sony",
    releaseYear: 1994,
  },

  // === ATARI ===
  atari2600: {
    code: "atari2600",
    displayName: "Atari 2600",
    type: "console",
    extensions: [".a26", ".bin", ...COMMON_ARCHIVE_FORMATS],
    requiresBios: false,
    manufacturer: "Atari",
    releaseYear: 1977,
  },

  // === ARCADE ===
  arcade: {
    code: "arcade",
    displayName: "Arcade (MAME)",
    type: "arcade",
    extensions: [".zip", ".7z"],
    requiresBios: false,
    manufacturer: "Various",
    releaseYear: 1971,
  },
};
