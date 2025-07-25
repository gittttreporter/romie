import type { SystemCode } from "@/types/system";

/**
 * Abbreviation mapping for each system, used for badges/tags.
 */
const SYSTEM_ABBREVIATIONS: Record<SystemCode, string> = {
  nes: "NES",
  snes: "SNES",
  n64: "N64",
  gb: "GB",
  gbc: "GBC",
  gba: "GBA",
  genesis: "GEN",
  sms: "SMS",
  gg: "GG",
  psx: "PSX",
  atari2600: "2600",
  arcade: "ARC",
};

/**
 * Human-readable display names for each system.
 */
const SYSTEM_DISPLAY_NAMES: Record<SystemCode, string> = {
  nes: "NES",
  snes: "Super Nintendo",
  n64: "Nintendo 64",
  gb: "Game Boy",
  gbc: "Game Boy Color",
  gba: "Game Boy Advance",
  genesis: "Sega Genesis",
  sms: "Master System",
  gg: "Game Gear",
  psx: "PlayStation",
  atari2600: "Atari 2600",
  arcade: "Arcade",
};

/**
 * Colors for each system, used for badges, icons, etc.
 */
const SYSTEM_COLORS: Record<SystemCode, string> = {
  nes: "#364d30", // subtle olive/dark sage
  snes: "#443966", // dusty indigo
  n64: "#375366", // soft steel blue
  gb: "#2c6153", // deep aqua
  gbc: "#38705e", // teal-blue
  gba: "#335966", // blue-gray
  genesis: "#563342", // muted plum
  sms: "#63503c", // soft brown
  gg: "#61603c", // olive green
  psx: "#373d66", // desaturated violet blue
  atari2600: "#77572d", // low-key ochre
  arcade: "#6a5a2e", // muted gold brown
};

/**
 * Returns the human display name for a system code.
 */
export function getSystemDisplayName(code: SystemCode): string {
  return SYSTEM_DISPLAY_NAMES[code] || code;
}

/**
 * Returns the preferred badge abbreviation for a system code.
 */
export function getSystemAbbreviation(code: SystemCode): string {
  return SYSTEM_ABBREVIATIONS[code] || code.toUpperCase();
}

/**
 * Returns the color (badge background) for a system code.
 */
export function getSystemColor(code: SystemCode): string {
  return SYSTEM_COLORS[code] || "#bbb";
}

/**
 * Gets an array of all system codes configured.
 */
export function getAllSystemCodes(): SystemCode[] {
  // Uses abbreviations list to drive valid keys (could use display names)
  return Object.keys(SYSTEM_ABBREVIATIONS) as SystemCode[];
}
