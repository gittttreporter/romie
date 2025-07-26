<template>
  <div v-if="rom" class="rom-details">
    <Card class="rom-details__card">
      <template #title>{{ rom.displayName }}</template>
      <template #subtitle>{{ systemDisplayName }}</template>
      <template #content>
        <ul class="rom-details__metadata">
          <li
            class="rom-details__metadata-item"
            v-for="{ label, value } in romMetadata"
          >
            <span class="rom-details__metadata-label">{{ label }}:</span>
            <span class="rom-details__metadata-value">{{ value }}</span>
          </li>
        </ul>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Card from "primevue/card";

import { useRomStore } from "@/stores";
import { getSystemDisplayName, getSystemColor } from "@/utils/system.utils";

// Props from route params
const route = useRoute();
const romStore = useRomStore();

const romId = computed(() => route.params.id as string);
const rom = computed(() => romStore.getRomById(romId.value));
const systemColor = computed(() =>
  rom.value ? getSystemColor(rom.value.system) : null,
);

const systemDisplayName = computed(() =>
  rom.value ? getSystemDisplayName(rom.value.system) : null,
);

const romMetadata = computed(() =>
  rom.value
    ? [
        { label: "Size", value: formatSize(rom.value.size) },
        { label: "Region", value: rom.value.region },
        { label: "Imported on", value: formatDatetime(rom.value.importedAt) },
        { label: "Filename", value: rom.value.originalFilename },
      ]
    : [],
);

// Helpers for formatting
function formatSize(size: number): string {
  if (size < 1024) return size + " bytes";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(2) + " MB";
}

function formatDatetime(dt: string): string {
  const d = new Date(dt);
  if (isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}
</script>

<style scoped lang="less">
.rom-details {
  width: 350px;
  padding: 16px;

  &__card {
    height: 100%;
  }

  &__metadata {
    list-style: none;
    padding: 0;
    margin: 0;
    margin-top: 20px;

    &-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      gap: 8px;
      flex-wrap: wrap;
    }

    &-label {
      text-transform: uppercase;
      font-size: 12px;
      opacity: 0.6;
    }

    &-value {
      font-size: 14px;
    }
  }
}
</style>
