<template>
  <RomListLayout :system="system" mode="system">
    <template #default="{ filteredRoms, loading }">
      <RomList
        class="system-view__content-list"
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
import { ref } from 'vue';
import RomListLayout from '@/layouts/RomListLayout.vue';
import RomDetailView from '@/views/RomDetailView.vue';
import RomActionView from '@/views/RomActionView.vue';
import RomList from '@/components/RomList.vue';

import type { SystemCode } from '@/types/system';

defineProps<{ system: SystemCode }>();
const romSelections = ref<string[]>([]);
</script>

<style lang="less" scoped></style>
