<template>
  <ul class="rom-list" :class="`rom-list--${compact ? 'compact' : 'normal'}`">
    <li v-for="rom in roms" :key="rom.id" :tabindex="0">
      <RomListItem
        :id="rom.id"
        :name="rom.displayName"
        :system="rom.system"
        :region="rom.region"
        :size="rom.size"
        :date-added="rom.importedAt"
        :is-active="romSelections.includes(rom.id)"
        @click="handleRomClick($event, rom)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";
import VirtualScroller from "primevue/virtualscroller";
import RomListItem from "./RomListItem.vue";

import type { Rom } from "@/types/rom";

const props = defineProps<{
  roms: Rom[];
  romSelections: string[];
  compact: boolean;
}>();
const emit = defineEmits<{
  (e: "rom-selected", romSelections: string[]): void;
}>();

const itemHeight = computed(() => (props.compact ? 40 : 72));

function toggleId(selections: string[], id: string): string[] {
  const idx = selections.indexOf(id);
  if (idx !== -1) {
    // Remove selection
    return [...selections.slice(0, idx), ...selections.slice(idx + 1)];
  } else {
    // Add
    return [...selections, id];
  }
}

function computeRangeSelection(
  selections: string[],
  roms: Rom[],
  clickedId: string,
): string[] {
  if (selections.length === 0) {
    return [clickedId];
  }

  const lastSelectedId = selections[selections.length - 1];
  const romIds = roms.map((r) => r.id);
  const startIdx = romIds.indexOf(lastSelectedId);
  const endIdx = romIds.indexOf(clickedId);

  if (startIdx !== -1 && endIdx !== -1) {
    const [from, to] = [startIdx, endIdx].sort((a, b) => a - b);
    return romIds.slice(from, to + 1);
  }

  return [clickedId];
}

function handleRomClick(event: MouseEvent, rom: Rom) {
  const romId = rom.id;
  const isToggle = event.ctrlKey || event.metaKey;
  const isRange = event.shiftKey;

  let newSelections: string[];

  if (isToggle) {
    newSelections = toggleId(props.romSelections, romId);
  } else if (isRange) {
    newSelections = computeRangeSelection(
      props.romSelections,
      props.roms,
      romId,
    );
  } else {
    newSelections = [romId];
  }

  emit("rom-selected", newSelections);
}
</script>

<style lang="less">
.rom-list {
  height: 100%;
  overflow: auto;
  padding: 0;
  margin: 0 8px;
  user-select: none;

  display: flex;
  flex-direction: column;
  gap: var(--p-list-gap);
}
</style>
