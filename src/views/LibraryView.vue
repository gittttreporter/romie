<template>
  <RomListLayout class="library-view" mode="all">
    <template #default="{ filteredRoms, loading }">
      <div class="library-view__summary">
        {{ librarySummary }}
      </div>
      <RomList
        class="library-view__content-list"
        :loading="loading"
        :roms="filteredRoms"
        :rom-selections="romSelections"
        :compact="false"
        @rom-selected="romSelections = $event"
      />
    </template>
    <template #rom-details>
      <RomDetailView
        v-if="romSelections.length === 1"
        :rom-id="romSelections[0]"
        @delete="romSelections = []"
      />
      <RomActionView
        v-else-if="romSelections.length > 1"
        :rom-selections="romSelections"
        @delete="romSelections = []"
      />
    </template>
  </RomListLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRomStore } from "@/stores";
import RomListLayout from "@/layouts/RomListLayout.vue";
import RomDetailView from "@/views/RomDetailView.vue";
import RomActionView from "@/views/RomActionView.vue";
import RomList from "@/components/RomList.vue";
import { formatBytes } from "@/utils/number.utils";
import { pluralize } from "@/utils/string.utils";

const romStore = useRomStore();
const romSelections = ref<string[]>([]);

// TODO: Empty state: “Your ROM library is empty. Time to add some games!”
const librarySummary = computed(() => {
  const { totalSizeBytes, totalRoms, systemCounts } = romStore.stats;
  const totalSystems = Object.keys(systemCounts).length;

  return `You have a ${formatBytes(totalSizeBytes)} ROM library with ${totalRoms} ${pluralize(totalRoms, "ROM")} across ${totalSystems} ${pluralize(totalSystems, "system")}.`;
});
</script>

<style lang="less" scoped>
.library-view {
  &__summary {
    font-size: var(--font-size-sm);
    color: var(--p-text-muted-color);
    padding: 4px 8px;
  }
}
</style>
