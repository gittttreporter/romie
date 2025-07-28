<template>
  <ul class="rom-list" :class="`rom-list--${compact ? 'compact' : 'normal'}`">
    <li v-for="rom in roms" :key="rom.id" :tabindex="0">
      <RouterLink
        :key="rom.id"
        :to="`/library/${rom.id}`"
        custom
        v-slot="{ navigate, isActive }"
      >
        <RomListItem
          :id="rom.id"
          :name="rom.displayName"
          :system="rom.system"
          :region="rom.region"
          :size="rom.size"
          :date-added="rom.importedAt"
          :is-active="isActive"
          @click="navigate"
        />
      </RouterLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import { useRouter } from "vue-router";
import VirtualScroller from "primevue/virtualscroller";
import RomListItem from "./RomListItem.vue";

import type { Rom } from "@/types/rom";

const router = useRouter();
const props = defineProps<{
  roms: Rom[];
  compact: boolean;
}>();

const itemHeight = computed(() => (props.compact ? 40 : 72));

function selectRom(rom: Rom) {
  console.log("Selected ROM:", rom.displayName);
  router.push({ name: "rom-detail", params: { id: rom.id } });
}
</script>

<style lang="less">
.rom-list {
  height: 100%; // Take full height of the content area
  overflow: auto;
  padding: 12px 0;
  margin: 0;
}
</style>
