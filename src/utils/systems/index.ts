import { SYSTEM_REGISTRY } from "./systemRegistry";
import type { SystemType, SystemCode, SystemInfo } from "@/types/system";

const RA_SYSTEM_MAPPING: Record<number, SystemCode> = {
  1: "genesis", // "Genesis/Mega Drive"
  2: "n64", // "Nintendo 64"
  3: "snes", // "SNES/Super Famicom"
  4: "gb", // "Game Boy"
  5: "gba", // "Game Boy Advance"
  6: "gbc", // "Game Boy Color"
  7: "nes", // "NES/Famicom"
  11: "sms", // "Master System"
  13: "lynx", // "Atari Lynx"
  14: "ngp", // "Neo Geo Pocket"
  15: "gg", // "Game Gear"
  18: "nds", // "Nintendo DS"
  25: "atari2600", // "Atari 2600"
  27: "arcade", // "Arcade"
  28: "vb", // "Virtual Boy"
};
const systems = Object.values(SYSTEM_REGISTRY);

export function getSystemByExtension(
  extension: string,
): SystemInfo | undefined {
  const ext = extension.toLowerCase();

  return systems.find((system) => system.extensions.includes(ext));
}

export function getSystemInfo(code: SystemCode): SystemInfo {
  const system = SYSTEM_REGISTRY[code];
  if (!system) {
    throw new Error(`Unknown system code: ${code}`);
  }
  return system;
}

export function getAllSupportedExtensions(): string[] {
  return systems.flatMap((system) => system.extensions).sort();
}

export function getSystemsByType(type: SystemType): SystemInfo[] {
  return systems.filter((system) => system.type === type);
}

export function determineSystemFromExtension(
  fileExtension: string,
): SystemCode {
  const system = getSystemByExtension(fileExtension);
  if (!system) {
    throw new Error(`Unsupported file extension: ${fileExtension}`);
  }

  return system.code;
}

export function determineSystemFromRAConsoleId(
  consoleId: number,
): SystemCode | null {
  return RA_SYSTEM_MAPPING[consoleId] || null;
}

/**
 * Returns the human display name for a system code.
 */
export function getSystemDisplayName(code: SystemCode): string {
  return SYSTEM_REGISTRY[code]?.displayName || code;
}

/**
 * Returns the preferred badge abbreviation for a system code.
 */
export function getSystemAbbreviation(code: SystemCode): string {
  switch (code) {
    case "genesis":
      return "GEN";
    case "atari2600":
      return "2600";
    case "arcade":
      return "ARC";
    default:
      return code.toUpperCase();
  }
}
