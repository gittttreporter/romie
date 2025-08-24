import type { DeviceProfile } from "../types";

export const ONION_OS_PROFILE: DeviceProfile = {
  id: "onion-os",
  name: "Onion",
  romBasePath: "/Roms/",
  biosBasePath: "/BIOS/",
  artworkConfig: {
    enabled: true,
    pathPattern: "{romBasePath}/{folderName}/Imgs/",
    supportedFormats: [".png"],
    maxWidth: 360,
    maxHeight: 250,
  },
  systemMappings: {
    nes: {
      folderName: "FC",
      supportedFormats: [".nes", ".zip", ".7z"],
    },
    snes: {
      folderName: "SFC",
      supportedFormats: [".sfc", ".snes", ".zip", ".7z"],
    },
    gb: {
      folderName: "GB",
      supportedFormats: [".gb", ".gbc", ".dmg", ".zip", ".7z"],
    },
    gbc: {
      folderName: "GBC",
      supportedFormats: [".gbc", ".gb", ".zip", ".7z"],
    },
    gba: {
      folderName: "GBA",
      supportedFormats: [".gba", ".bin", ".zip", ".7z"],
    },
    genesis: {
      folderName: "MD",
      supportedFormats: [".md", ".gen", ".smd", ".zip", ".7z"],
    },
    sms: {
      folderName: "MS",
      supportedFormats: [".sms", ".zip", ".7z"],
    },
    gg: {
      folderName: "GG",
      supportedFormats: [".gg", ".zip", ".7z"],
    },
    psx: {
      folderName: "PS",
      supportedFormats: [".cue", ".iso", ".chd", ".pbp", ".zip", ".7z"],
    },
    atari2600: {
      folderName: "ATARI",
      supportedFormats: [".a26", ".bin", ".zip", ".7z"],
    },
    arcade: {
      folderName: "ARCADE",
      supportedFormats: [".zip", ".7z"],
    },
  },
};
