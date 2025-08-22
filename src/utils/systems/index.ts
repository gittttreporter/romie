import { SYSTEM_REGISTRY } from "./systemRegistry";
import type { SystemType, SystemCode, SystemInfo } from "@/types/system";

// Helper functions
export function getSystemByExtension(
  extension: string,
): SystemInfo | undefined {
  const ext = extension.toLowerCase();
  return Object.values(SYSTEM_REGISTRY).find((system) =>
    system.extensions.includes(ext),
  );
}

export function getSystemInfo(code: SystemCode): SystemInfo {
  const system = SYSTEM_REGISTRY[code];
  if (!system) {
    throw new Error(`Unknown system code: ${code}`);
  }
  return system;
}

export function getAllSupportedExtensions(): string[] {
  return Object.values(SYSTEM_REGISTRY)
    .flatMap((system) => system.extensions)
    .sort();
}

export function getSystemsByType(type: SystemType): SystemInfo[] {
  return Object.values(SYSTEM_REGISTRY).filter(
    (system) => system.type === type,
  );
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
