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

import {
  getSystemAbbreviation,
  getSystemDisplayName,
  getSystemColor,
} from "@/utils/system.utils";

const props = defineProps<{
  code: SystemCode;
  // Optionally override from parent
  color?: string;
}>();

// Use mapped abbreviation, else fall back to uppercase code
const abbr = computed(() => getSystemAbbreviation(props.code));
const systemDisplayName = computed(() => getSystemDisplayName(props.code));

const systemColorComputed = computed(
  () => props.color || getSystemColor(props.code),
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
