import type { RomApi, DeviceApi, SyncApi } from "./electron-api";

declare global {
  interface Window {
    rom: RomApi;
    device: DeviceApi;
    sync: SyncApi;
    darkMode: {
      onChange(callback: (value: boolean) => void): () => void;
      value(): Promise<boolean>;
      toggle(): Promise<boolean>;
      system(): Promise<void>;
    };
    util: {
      openExternalLink(url: string): Promise<void>;
    };
  }
}
