<template>
  <RomListLayout :tag="tag" mode="tag">
    <template #default="{ filteredRoms, loading }">
      <RomList
        class="library-view__content-list"
        :loading="loading"
        :roms="filteredRoms"
        :compact="false"
        @rom-selected="handleRomSelection"
      />
    </template>
    <template #rom-details>
      <RouterView />
    </template>
  </RomListLayout>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { useRouter } from "vue-router";
import RomListLayout from "@/layouts/RomListLayout.vue";
import RomList from "@/components/RomList.vue";

import type { Rom } from "@/types/rom";

const props = defineProps<{ tag: string }>();
const router = useRouter();

function handleRomSelection(rom: Rom) {
  router.push({
    name: "TagRomDetail",
    params: {
      id: rom.id,
      tag: props.tag,
    },
  });
}
</script>

<style scoped lang="less">
.collection-detail-view {
}
</style>
