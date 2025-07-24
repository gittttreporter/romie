<template>
  <div class="rom-list" :class="`rom-list--${compact ? 'compact' : 'normal'}`">
    <VirtualScroller
      :items="roms"
      :itemSize="itemHeight"
      class="rom-list__scroller"
    >
      <template v-slot:item="{ item: rom }">
        <RomListItem
          :id="rom.id"
          :name="rom.displayName"
          :system="rom.system"
          :region="rom.region"
          :size="rom.size"
          :date-added="rom.importedAt"
        />
      </template>
    </VirtualScroller>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import VirtualScroller from "primevue/virtualscroller";
import RomListItem from "./RomListItem.vue";

import type { Rom } from "@/types/rom";

const props = defineProps<{
  roms: Rom[];
  compact: boolean;
}>();

const itemHeight = computed(() => (props.compact ? 40 : 72));

function selectRom(rom: Rom) {
  console.log("Selected ROM:", rom.displayName);
}
</script>

<style lang="less">
.rom-list {
  height: 100%; // Take full height of the content area
  width: 100%;

  &__scroller {
    height: 100%; // VirtualScroller takes full height of rom-list
    width: 100%;
    overflow: auto;
  }

  // Your existing BEM styles here...
  &--compact {
    // compact styles
  }

  &--normal {
    // normal styles
  }
}
</style>
