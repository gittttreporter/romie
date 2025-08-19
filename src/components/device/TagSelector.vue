<template>
  <!-- WIP -->
  <Card class="device-view__tag-card">
    <template #title>Tags to Sync</template>
    <template #subtitle>
      Syncing copies your selected ROMs to the device. Existing ROMs and saves
      stay safe unless you choose to clean the destination first.
    </template>
    <template #content>
      <div class="tag-selection">
        <div class="tag-selection__input">
          <MultiSelect
            v-model="selectedTagszzz"
            :options="availableTags"
            optionLabel="tag"
            placeholder="Choose tags to sync"
            class="w-full"
            :maxSelectedLabels="3"
          />
          <div class="tag-selection__pills">
            <Chip
              v-for="{ tag } in selectedTags"
              :key="tag"
              removable
              @remove="unselectTag(tag)"
            >
              {{ tag }}
            </Chip>
          </div>
        </div>

        <div class="tag-selection__controls">
          <div class="tag-selection__actions">
            <Button
              label="Start Sync"
              icon="pi pi-sync"
              :disabled="!canStartSync"
              @click="emit('startSync', syncOptions)"
              class="tag-selection__sync-button"
            />
            <small
              v-if="totalSelectedRoms > 0"
              class="tag-selection__action-subtitle"
            >
              Syncing {{ totalSelectedRoms }} ROMs ({{
                formatFileSize(totalSelectedSize)
              }}) will take approximately {{ estimatedSyncTime }}
            </small>
          </div>
          <div class="tag-selection__options">
            <div class="tag-selection__option">
              <Checkbox
                v-model="syncOptions.cleanDestination"
                inputId="clean-destination"
                binary
              />
              <div class="tag-selection__option-content">
                <label
                  for="clean-destination"
                  class="tag-selection__option-label"
                  >Clean destination before sync</label
                >
                <small class="tag-selection__option-subtitle"
                  >Removes everything in <code>/Roms/</code> before
                  syncing</small
                >
              </div>
            </div>
            <div class="tag-selection__option">
              <Checkbox
                v-model="syncOptions.verifyFiles"
                inputId="verify-files"
                binary
              />
              <div class="tag-selection__option-content">
                <label for="verify-files" class="tag-selection__option-label"
                  >Verify files after copy</label
                >
                <small class="tag-selection__option-subtitle"
                  >Double-checks your ROMs made it safely (a little slower but
                  safer)</small
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Card from "primevue/card";
import Chip from "primevue/chip";
import MultiSelect from "primevue/multiselect";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import { useRomStore } from "@/stores";
import type { TagStats } from "@/types/rom";
import type { SyncOptions } from "@/types/electron-api";

const props = defineProps<{
  selectedTags: TagStats[];
}>();
const emit = defineEmits<{
  (e: "update:selectedTags", update: TagStats[]): void;
  (e: "startSync", options: SyncOptions): void;
}>();

const romStore = useRomStore();
const syncOptions = ref<SyncOptions>({
  cleanDestination: false,
  verifyFiles: true,
});

const canStartSync = computed(() => {
  return (
    sdCardStatus.value.connected &&
    selectedTags.value.length > 0 &&
    syncStatus.value.phase === "idle"
  );
});

const availableTags = computed((): TagStats[] => {
  return Object.values(romStore.stats.tagStats);
});

function unselectTag(tagId: string) {
  selectedTags.value = selectedTags.value.filter(({ tag }) => tag !== tagId);
}
</script>
