import type { DeviceProfile } from "@/types/device";

const ONION_OS_PROFILE: DeviceProfile = {
  id: "onion-os",
  name: "OnionOS (MiyooMini)",
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
    n64: {
      folderName: "N64",
      supportedFormats: [".n64", ".v64", ".z64", ".zip", ".7z"],
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
const profiles: Record<string, DeviceProfile> = {
  "onion-os": ONION_OS_PROFILE,
};

export const getDeviceProfile = (id: string): DeviceProfile | null => {
  return profiles[id] || null;
};

export const getAllDeviceProfiles = (): DeviceProfile[] => {
  return Object.values(profiles);
};
