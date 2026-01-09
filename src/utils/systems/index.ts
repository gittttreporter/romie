import path from 'node:path';
import { ConsoleId, type ConsoleIdValue } from 'node-rcheevos';
import { SYSTEM_REGISTRY } from './systemRegistry';
import { SYSTEM_CODES, type SystemType, type SystemCode, type SystemInfo } from '@/types/system';

import type { RomFile } from '@/types/rom';

interface RASystemMapping {
  consoleId: ConsoleIdValue; // RetroArch console ID
  code: SystemCode; // Internal system code
}

const RA_SYSTEMS: RASystemMapping[] = [
  { consoleId: ConsoleId.MEGA_DRIVE, code: 'genesis' },
  { consoleId: ConsoleId.NINTENDO_64, code: 'n64' },
  { consoleId: ConsoleId.SUPER_NINTENDO, code: 'snes' },
  { consoleId: ConsoleId.GAMEBOY, code: 'gb' },
  { consoleId: ConsoleId.GAMEBOY_ADVANCE, code: 'gba' },
  { consoleId: ConsoleId.GAMEBOY_COLOR, code: 'gbc' },
  { consoleId: ConsoleId.NINTENDO, code: 'nes' },
  { consoleId: ConsoleId.MASTER_SYSTEM, code: 'sms' },
  { consoleId: ConsoleId.ATARI_LYNX, code: 'lynx' },
  { consoleId: ConsoleId.NEOGEO_POCKET, code: 'ngp' },
  { consoleId: ConsoleId.GAME_GEAR, code: 'gg' },
  { consoleId: ConsoleId.NINTENDO_DS, code: 'nds' },
  { consoleId: ConsoleId.ATARI_2600, code: 'atari2600' },
  { consoleId: ConsoleId.ARCADE, code: 'arcade' },
  { consoleId: ConsoleId.VIRTUAL_BOY, code: 'vb' },
  { consoleId: ConsoleId.PSP, code: 'psp' },
];

const systems = Object.values(SYSTEM_REGISTRY);

// Mapping of RetroArch Console IDs to internal system codes
const RA_SYSTEM_MAPPING = Object.fromEntries(RA_SYSTEMS.map((s) => [s.consoleId, s.code]));
const RA_CONSOLE_MAPPING = Object.fromEntries(RA_SYSTEMS.map((s) => [s.code, s.consoleId]));

export function isSystemCode(code: SystemCode): code is SystemCode {
  return SYSTEM_CODES.includes(code);
}

export function getSystemByExtension(extension: string): SystemInfo[] {
  const ext = extension.toLowerCase();

  return systems.filter((system) => system.extensions.includes(ext));
}

export function getConsoleIdForSystem(code: SystemCode): ConsoleIdValue | null {
  return RA_CONSOLE_MAPPING[code] || null;
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

export function determineSystem(romFile: RomFile): SystemCode {
  const { sourcePath, romFilename } = romFile;
  const fileExtension = path.extname(romFilename);

  const matches = getSystemByExtension(fileExtension);
  if (matches.length === 1) return matches[0].code;

  const system = determineSystemFromParentFolder(sourcePath);
  if (!system) {
    throw new Error(`Unsupported file extension: ${fileExtension}`);
  }

  return system;
}

export function determineSystemFromParentFolder(sourcePath: string): SystemCode | null {
  const parentFolder = path.basename(path.dirname(sourcePath));
  const matchedSystem = systems.find((system) =>
    system.aliases?.some((alias) => alias.toLowerCase() === parentFolder.toLowerCase())
  );

  return matchedSystem ? matchedSystem.code : null;
}

export function determineSystemFromRAConsoleId(consoleId: number): SystemCode | null {
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
    case 'genesis':
      return 'GEN';
    case 'atari2600':
      return '2600';
    case 'arcade':
      return 'ARC';
    default:
      return code.toUpperCase();
  }
}
