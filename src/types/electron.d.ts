import type { RomApi } from "./electron-api";

declare global {
  interface Window {
    rom: RomApi;
    util: {
      openExternalLink(url: string): Promise<void>;
    };
  }
}
