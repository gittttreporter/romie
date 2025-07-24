<template>
  <div class="library-view">
    <div class="library-view__header">
      <IconField>
        <InputIcon>
          <i class="pi pi-search" />
        </InputIcon>
        <InputText v-model="searchQuery" placeholder="Search in your library" />
      </IconField>
    </div>
    <div class="library-view__content">
      <RomList v-if="!romStore.loading" :roms="filteredRoms" :compact="false" />
      <div v-else class="library-view__loading">Loading...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { useRomStore } from "@/stores";
import RomList from "@/components/RomList.vue";

import type { Rom } from "@/types/rom";

const romStore = useRomStore();
const searchQuery = ref("");

// Load ROMs when component mounts
onMounted(async () => {
  await romStore.loadRoms();
  console.log(romStore.roms);
});

const sortedRoms = computed(() => {
  return romStore.roms.sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
});

const filteredRoms = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  if (!query) {
    return sortedRoms.value; // Return all ROMs if no search query
  }

  return sortedRoms.value.filter((rom) => {
    const { displayName, system, region } = rom;

    return [displayName, system, region].some((value) => {
      return value?.toLowerCase().includes(query);
    });
  });
});
</script>

<style lang="less" scoped>
.library-view {
  height: 100vh; // Take full viewport height
  display: flex;
  flex-direction: column;

  &__header {
    padding: 16px;
    flex-shrink: 0;
    z-index: 10; // Keep header above scrolling content
  }

  &__content {
    flex: 1; // Take remaining space after header
    min-height: 0; // Critical! Allows flex child to shrink below content size
    overflow: hidden;
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 1.2rem;
    color: var(--text-color-secondary);
  }
}
</style>
