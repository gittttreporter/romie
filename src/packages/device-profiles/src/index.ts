import type { DeviceProfile, DeviceProfileDraft } from "./types";
import { ONION_OS_PROFILE } from "./profiles/onion";
import { KNULLI_PROFILE } from "./profiles/knulli";
import { MUOS_PROFILE } from "./profiles/muos";

// Export types
export type * from "./types";

// Registry of all device profiles
const profiles: Record<string, DeviceProfile> = {
  [ONION_OS_PROFILE.id]: ONION_OS_PROFILE,
  [KNULLI_PROFILE.id]: KNULLI_PROFILE,
  [MUOS_PROFILE.id]: MUOS_PROFILE,
};

// API functions
export const getDeviceProfile = (id: string): DeviceProfile | null => {
  return profiles[id] || null;
};

export const getAllDeviceProfiles = (): DeviceProfile[] => {
  return Object.values(profiles);
};

export const getDeviceProfileIds = (): string[] => {
  return Object.keys(profiles);
};

export function cloneProfile(
  baseProfileId: string,
  newName: string,
): DeviceProfileDraft {
  const baseProfile = getDeviceProfile(baseProfileId);
  if (!baseProfile) {
    throw new Error(`Base profile with ID "${baseProfileId}" not found.`);
  }
  const { id, ...rest } = baseProfile;

  return {
    ...structuredClone(rest),
    name: newName,
    isBuiltIn: false,
  };
}
