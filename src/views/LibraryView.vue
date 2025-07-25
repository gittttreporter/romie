<template>
  <div class="library-view">
    <div class="library-view__header">
      <div class="library-view__header-actions">
        <!-- TODO: Add this back once grid view is implemented
        <SelectButton
          v-model="listMode"
          :options="listModeOptions"
          optionValue="value"
          dataKey="value"
          size="small"
          aria-labelledby="custom"
        >
          <template #option="slotProps">
            <i :class="slotProps.option.icon"></i>
          </template>
        </SelectButton> -->
      </div>
      <IconField>
        <InputIcon>
          <i class="pi pi-search" />
        </InputIcon>
        <InputText
          v-model="searchQuery"
          size="small"
          placeholder="Search in your library"
        />
      </IconField>
      <Button
        :icon="`pi pi-filter${showFilters ? '-slash' : ''}`"
        size="small"
        severity="secondary"
        aria-label="Filters"
        @click="toggleFilters"
      />
    </div>
    <div v-if="showFilters" class="library-view__filters">
      <MultiSelect
        v-model="filterBySystem"
        :options="filterSystems"
        :filled="true"
        optionLabel="label"
        optionValue="value"
        placeholder="System"
        size="small"
      />
      <MultiSelect
        v-model="filterByRegion"
        :options="filterRegions"
        :filled="true"
        optionLabel="label"
        optionValue="value"
        placeholder="Region"
        size="small"
      />
    </div>
    <div class="library-view__content">
      <RomList v-if="!romStore.loading" :roms="filteredRoms" :compact="false" />
      <div v-else class="library-view__loading">Loading...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import MultiSelect from "primevue/multiselect";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { useRomStore } from "@/stores";
import RomList from "@/components/RomList.vue";
import { getSystemDisplayName } from "@/utils/system.utils";

import type { Rom } from "@/types/rom";

const romStore = useRomStore();
const searchQuery = ref("");
const listMode = ref("list");
const listModeOptions = ref([
  { icon: "pi pi-list", value: "list" },
  { icon: "pi pi-th-large", value: "grid" },
]);
const showFilters = ref(false);
const filterBySystem = ref([]);
const filterByRegion = ref([]);

// Load ROMs when component mounts
onMounted(async () => {
  await romStore.loadRoms();
  console.log(romStore.roms);
});

const filterSystems = computed(() => {
  const systems = getUniqueRomValues("system");

  return systems
    .filter(Boolean)
    .map((system) => ({
      value: system,
      label: getSystemDisplayName(system),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const filterRegions = computed(() => {
  const regions = getUniqueRomValues("region");

  return regions
    .filter(Boolean)
    .map((region) => ({
      value: region,
      label: region,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const sortedRoms = computed(() => {
  return romStore.roms.sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
});

const filteredRoms = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const selectedRegions = filterByRegion.value;
  const selectedSystems = filterBySystem.value;

  console.log("query", query);
  console.log("selectedRegions", selectedRegions);
  console.log("selectedSystems", selectedSystems);

  return sortedRoms.value.filter((rom) => {
    const { displayName, system, region } = rom;
    const hasSystemMatch =
      !selectedSystems?.length ||
      selectedSystems.some((value) => value === system);
    const hasRegionMatch =
      !selectedRegions?.length ||
      selectedRegions.some((value) => value === region);
    const hasQueryMatch = !query || displayName.toLowerCase().includes(query);

    return hasSystemMatch && hasRegionMatch && hasQueryMatch;
  });
});

function toggleFilters() {
  if (showFilters.value) {
    filterByRegion.value = [];
    filterBySystem.value = [];
  }
  showFilters.value = !showFilters.value;
}

function getUniqueRomValues<T extends keyof Rom>(field: T) {
  return Array.from(
    new Set(romStore.roms.map((rom) => rom[field]).filter(Boolean)),
  );
}
</script>

<style lang="less" scoped>
.library-view {
  height: 100vh;
  display: flex;
  flex-direction: column;

  &__header {
    padding: 10px 16px;
    border-bottom: 1px solid black;
    display: flex;
    align-items: center;
    gap: 8px;

    &-actions {
      flex: 1;
    }
  }

  &__filters {
    padding: 4px 16px;
    flex-shrink: 0;
    border-bottom: 1px solid black;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    background-color: #1a1a1a;
  }

  &__content {
    flex: 1;
    min-height: 0;
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
