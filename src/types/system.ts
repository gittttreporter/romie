export type SystemCode =
  // Nintendo Consoles
  | "nes"
  | "snes"
  | "n64"
  // Nintendo Handhelds
  | "vb"
  | "gb"
  | "gbc"
  | "gba"
  | "nds"
  // SNK
  | "ngp"
  // Sega Consoles
  | "genesis"
  | "sms"
  | "gg"
  // Sony
  | "psx"
  // Atari
  | "lynx"
  | "atari2600"
  // Arcade
  | "arcade";

export type SystemType = "console" | "handheld" | "arcade";

export interface SystemInfo {
  code: SystemCode;
  displayName: string;
  fullName: string;
  type: SystemType;
  extensions: string[];
  requiresBios?: boolean;
  biosFiles?: string[];
  manufacturer?: string;
  releaseYear?: number;
}
