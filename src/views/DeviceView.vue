<template>
  <PageLayout class="device-view" :title="device?.name">
    <template #subtitle> Sync ROM files to your device </template>

    <div class="device-view__content">
      <!-- Device Status Section -->
      <Card class="device-view__status-card">
        <template #title>Device Status</template>
        <template #content>
          <div class="device-status">
            <div class="device-status__item">
              <i class="device-status__icon pi pi-microchip"></i>
              <span class="device-status__label">MIYOOSD:</span>
              <Tag
                v-if="sdCardStatus.connected"
                icon="pi pi-check"
                severity="success"
                value="Connected"
              ></Tag>
              <Tag
                v-else
                icon="pi pi-times"
                severity="danger"
                value="Disconnected"
              ></Tag>
            </div>
            <div class="device-status__item">
              <i class="device-status__icon pi pi-cog"></i>
              <span class="device-status__label">Device Profile:</span>
              <Tag :value="selectedCopyProfile.name" severity="secondary" />
            </div>
            <div class="device-status__item" v-if="sdCardStatus.connected">
              <i class="device-status__icon pi pi-database"></i>
              <span class="device-status__label">Available Space:</span>
              <span class="device-status__value">{{
                sdCardStatus.freeSpace
              }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Tag Selection Section -->
      <Card class="device-view__tag-card">
        <template #title>Tags to Sync</template>
        <template #subtitle>
          Syncing copies your selected ROMs to the device. Existing ROMs and
          saves stay safe unless you choose to clean the destination first.
        </template>
        <template #content>
          <div class="tag-selection">
            <div class="tag-selection__input">
              <MultiSelect
                v-model="selectedTags"
                :options="availableTags"
                optionLabel="name"
                placeholder="Choose tags to sync"
                class="w-full"
                :maxSelectedLabels="3"
              />
              <div class="tag-selection__pills">
                <Chip v-for="tag in selectedTags" :key="tag.id" removable>
                  {{ tag.name }}
                </Chip>
              </div>
            </div>

            <div class="tag-selection__controls">
              <div class="tag-selection__actions">
                <Button
                  label="Start Sync"
                  icon="pi pi-sync"
                  :disabled="!canStartSync"
                  :loading="syncInProgress"
                  @click="startSync"
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
                    <label
                      for="verify-files"
                      class="tag-selection__option-label"
                      >Verify files after copy</label
                    >
                    <small class="tag-selection__option-subtitle"
                      >Double-checks your ROMs made it safely (a little slower
                      but safer)</small
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import PageLayout from "@/layouts/PageLayout.vue";
import Card from "primevue/card";
import Chip from "primevue/chip";
import Tag from "primevue/tag";
import MultiSelect from "primevue/multiselect";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import { useDeviceStore } from "@/stores";

import { Device } from "@/types/device";

interface Tag {
  id: string;
  name: string;
  romCount: number;
  totalSize: number;
}

interface CopyProfile {
  id: string;
  name: string;
  osType: string;
}

interface SdCardStatus {
  connected: boolean;
  freeSpace: string;
  totalSpace: string;
}

interface SyncOptions {
  cleanDestination: boolean;
  verifyFiles: boolean;
}

const props = defineProps<{
  deviceId: string;
}>();

const deviceStore = useDeviceStore();
const device = ref<Device | null>(null);

// Stubbed data
const selectedTags = ref<Tag[]>([]);
const availableTags = ref<Tag[]>([
  { id: "1", name: "Favorites", romCount: 25, totalSize: 1024 * 1024 * 512 }, // 512MB
  { id: "2", name: "Platformers", romCount: 43, totalSize: 1024 * 1024 * 1024 }, // 1GB
  { id: "3", name: "RPGs", romCount: 18, totalSize: 1024 * 1024 * 1024 * 2.5 }, // 2.5GB
  { id: "4", name: "Arcade", romCount: 67, totalSize: 1024 * 1024 * 800 }, // 800MB
  { id: "5", name: "Puzzle", romCount: 31, totalSize: 1024 * 1024 * 256 }, // 256MB
]);

const selectedCopyProfile = ref<CopyProfile>({
  id: "1",
  name: "Onion OS (MiyooMini+)",
  osType: "onion",
});

const sdCardStatus = ref<SdCardStatus>({
  connected: true,
  freeSpace: "28.4 GB",
  totalSpace: "32 GB",
});

const syncOptions = ref<SyncOptions>({
  cleanDestination: false,
  verifyFiles: true,
});

const syncInProgress = ref(false);

// Computed properties
const totalSelectedRoms = computed(() => {
  return selectedTags.value.reduce((total, tag) => total + tag.romCount, 0);
});

const totalSelectedSize = computed(() => {
  return selectedTags.value.reduce((total, tag) => total + tag.totalSize, 0);
});

const estimatedSyncTime = computed(() => {
  const sizeInGB = totalSelectedSize.value / (1024 * 1024 * 1024);
  const minutes = Math.ceil(sizeInGB * 2); // Rough estimate: 2 minutes per GB
  return minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
});

const canStartSync = computed(() => {
  return (
    sdCardStatus.value.connected &&
    selectedTags.value.length > 0 &&
    !syncInProgress.value
  );
});

// Methods

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const startSync = () => {
  syncInProgress.value = true;
  // TODO: Implement actual sync logic
  console.log("Starting sync with options:", syncOptions.value);
};

onMounted(async () => {
  device.value = await deviceStore.loadDeviceById(props.deviceId);
  console.log(device.value);
});
</script>

<style lang="less" scoped>
.device-view {
  &__content {
    max-width: 48rem;
  }

  &__status-card,
  &__tag-card,
  &__sync-card {
    margin-bottom: 1.5rem;
  }
}

.tag-selection {
  display: flex;
  flex-direction: column;
  margin-top: var(--space-8);
  gap: var(--space-20);

  &__pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
    margin-top: var(--space-6);
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  &__sync-button {
    align-self: flex-start;
    min-width: 200px;
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__option {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  &__option-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  &__option-label {
    cursor: pointer;
    font-weight: 500;
    line-height: 1.2;
  }

  &__action-subtitle,
  &__option-subtitle {
    color: var(--p-text-muted-color);
    font-size: 0.85rem;
    line-height: 1.3;
    margin: 0;
  }
}

.tag-pill {
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  min-width: 0;
  flex: 0 1 auto;

  &__name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-color);
    line-height: 1.2;
  }

  &__subtitle {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    margin-top: 0.25rem;
    line-height: 1.2;
  }
}

.device-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__icon {
    width: 1.5rem;
    color: var(--primary-color);
  }

  &__label {
    font-weight: 600;
    min-width: 120px;
  }

  &__value {
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .device-status {
    gap: 0.75rem;

    &__item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    &__label {
      min-width: auto;
    }
  }

  .tag-selection {
    &__pills {
      flex-direction: column;
    }

    &__sync-button {
      min-width: auto;
      align-self: stretch;
    }

    &__options {
      gap: 1rem;
    }
  }

  .tag-pill {
    width: 100%;
  }
}
</style>
