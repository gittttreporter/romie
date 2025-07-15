export type SystemCode =
  // Nintendo Consoles
  | 'nes'
  | 'snes'
  | 'n64'
  // Nintendo Handhelds
  | 'gb'
  | 'gbc'
  | 'gba'
  // Sega Consoles
  | 'genesis'
  | 'sms'
  | 'gg'
  // Sony
  | 'psx'
  // Atari
  | 'atari2600'
  // Arcade
  | 'arcade';

export type SystemType =
  | 'console'
  | 'handheld'
  | 'arcade';

export interface SystemInfo {
  code: SystemCode;
  displayName: string;
  type: SystemType;
  extensions: string[];
  requiresBios?: boolean;
  biosFiles?: string[];
  manufacturer?: string;
  releaseYear?: number;
}
