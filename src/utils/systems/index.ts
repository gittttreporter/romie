import { SYSTEM_REGISTRY } from "./systemRegistry";
import type { SystemType, SystemCode, SystemInfo } from "@/types/system";

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
