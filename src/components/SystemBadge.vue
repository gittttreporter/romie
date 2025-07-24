<template>
  <span
    class="system-badge"
    :style="{ backgroundColor: systemColorComputed, color: textColor }"
    :title="systemDisplayName"
  >
    {{ abbr }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SystemCode } from "@/types/system";

// Abbreviation mapping table
const SYSTEM_ABBREVIATIONS: Record<SystemCode, string> = {
  nes: "NES",
  snes: "SNES",
  n64: "N64",
  gb: "GB",
  gbc: "GBC",
  gba: "GBA",
  genesis: "GEN",
  sms: "SMS",
  gg: "GG",
  psx: "PSX",
  atari2600: "2600",
  arcade: "ARC",
};

// Human display name mapping (for accessibility/title)
const SYSTEM_DISPLAY_NAMES: Record<SystemCode, string> = {
  nes: "Nintendo Entertainment System",
  snes: "Super Nintendo Entertainment System",
  n64: "Nintendo 64",
  gb: "Game Boy",
  gbc: "Game Boy Color",
  gba: "Game Boy Advance",
  genesis: "Sega Genesis",
  sms: "Sega Master System",
  gg: "Game Gear",
  psx: "Sony PlayStation",
  atari2600: "Atari 2600",
  arcade: "Arcade",
};

// System color mapping (customize as desired)
const SYSTEM_COLORS: Record<SystemCode, string> = {
  nes: "#364d30", // subtle olive/dark sage
  snes: "#443966", // dusty indigo
  n64: "#375366", // soft steel blue
  gb: "#2c6153", // deep aqua
  gbc: "#38705e", // teal-blue
  gba: "#335966", // blue-gray
  genesis: "#563342", // muted plum
  sms: "#63503c", // soft brown
  gg: "#61603c", // olive green
  psx: "#373d66", // desaturated violet blue
  atari2600: "#77572d", // low-key ochre
  arcade: "#6a5a2e", // muted gold brown
};

const props = defineProps<{
  code: SystemCode;
  // Optionally override from parent
  color?: string;
}>();

// Use mapped abbreviation, else fall back to uppercase code
const abbr = computed(
  () => SYSTEM_ABBREVIATIONS[props.code] || props.code.toUpperCase(),
);
const systemDisplayName = computed(
  () => SYSTEM_DISPLAY_NAMES[props.code] || props.code,
);

const systemColorComputed = computed(
  () => props.color || SYSTEM_COLORS[props.code] || "#bbb",
);

// Ensure decent readability for badge text
function getContrastYIQ(hexColor: string) {
  // Strip '#' if present
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // YIQ formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? "#222" : "#fff";
}

const textColor = computed(() => getContrastYIQ(systemColorComputed.value));
</script>

<style scoped lang="less">
.system-badge {
  display: inline-block;
  width: 3.6em; // Fits up to 4 letters e.g., "2600"
  min-width: 2.2em;
  font-size: 0.65em;
  font-weight: 700;
  border-radius: 6px;
  text-align: center;
  line-height: 1.8em;
  padding: 0 0.2em;
  letter-spacing: 0.04em;
  user-select: none;
  vertical-align: middle;
  transition:
    background 0.18s,
    color 0.18s;
  box-shadow: 0 1px 3px 0 rgba(20, 24, 30, 0.07);
  opacity: 0.85;
}
</style>
