<template>
  <RomListLayout :tag="tag" mode="tag">
    <template #default="{ filteredRoms, loading }">
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
import { defineProps, ref, computed } from "vue";
import { useRouter } from "vue-router";
import RomListLayout from "@/layouts/RomListLayout.vue";
import RomDetailView from "@/views/RomDetailView.vue";
import RomActionView from "@/views/RomActionView.vue";
import RomList from "@/components/RomList.vue";

const props = defineProps<{ tag: string }>();
const router = useRouter();
const romSelections = ref<string[]>([]);
</script>

<style scoped lang="less"></style>
