import type { RomApi, DeviceApi } from "./electron-api";

declare global {
  interface Window {
    rom: RomApi;
    device: DeviceApi;
    util: {
      openExternalLink(url: string): Promise<void>;
    };
  }
}
