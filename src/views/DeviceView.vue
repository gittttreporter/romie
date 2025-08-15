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
      <Card v-if="syncPhase === 'idle'" class="device-view__tag-card">
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

      <!-- Sync Progress Section -->
      <Card v-else class="device-view__sync-card">
        <template #title>Syncing...</template>
        <template #subtitle>
          Syncing {{ totalSelectedRoms }} ROMs ({{
            formatFileSize(totalSelectedSize)
          }}) should take approximately {{ estimatedSyncTime }}
        </template>
        <template #content>
          <div class="sync-progress">
            <div class="progress-bar">
              <div class="progress-bar__header">
                <div class="progress-bar__header-title">
                  <span v-if="syncPhase === 'preparing'">
                    Preparing for sync...
                  </span>
                  <span v-else>Copying: {{ currentFile }}</span>
                </div>
                <div class="progress-bar__header-action">
                  <i v-if="syncError" class="pi pi-times error"></i>
                  <i v-else-if="syncSuccess" class="pi pi-check success"></i>
                  <Button
                    v-else
                    icon="pi pi-times"
                    severity="secondary"
                    variant="text"
                    rounded
                    aria-label="Cancel"
                    @click="cancelSync"
                  />
                </div>
              </div>
              <ProgressBar
                :mode="
                  syncPhase === 'preparing' ? 'indeterminate' : 'determinate'
                "
                :value="progressPercent"
              ></ProgressBar>
              <div class="progress-bar__footer">
                <div v-if="syncError" class="error">
                  {{ syncError }}
                </div>
                <div v-else-if="syncPhase === 'preparing'">
                  Preparing files...
                </div>
                <div v-else-if="syncPhase === 'syncing'">
                  {{ filesProcessed }} of {{ totalFiles }} files
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
import ProgressBar from "primevue/progressbar";
import { useConfirm } from "primevue/useconfirm";
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

const confirm = useConfirm();
const deviceStore = useDeviceStore();
const device = ref<Device | null>(null);

// Stubbed data
const selectedTags = ref<Tag[]>([]);
const availableTags = ref<Tag[]>([
  { id: "1", name: "Favorites", romCount: 8, totalSize: 1024 * 1024 * 512 }, // 512MB
  { id: "2", name: "Platformers", romCount: 12, totalSize: 1024 * 1024 * 1024 }, // 1GB
  { id: "3", name: "RPGs", romCount: 6, totalSize: 1024 * 1024 * 1024 * 2.5 }, // 2.5GB
  { id: "4", name: "Arcade", romCount: 15, totalSize: 1024 * 1024 * 800 }, // 800MB
  { id: "5", name: "Puzzle", romCount: 5, totalSize: 1024 * 1024 * 256 }, // 256MB
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

const syncInProgress = ref(false); // TODO: Revert, only used while working on sync UI
const syncPhase = ref<
  "idle" | "preparing" | "syncing" | "verifying" | "cancelled" | "done"
>("idle");
const syncError = ref("");
const syncSuccess = ref(false);

// Mock progress data
const currentFile = ref("");
const filesProcessed = ref(0);
const totalFiles = ref(0);
const progressPercent = ref(0);

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
    syncPhase.value === "idle"
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

// TODO: Implement actual sync logic
const startSync = () => {
  syncPhase.value = "preparing";

  // Set up mock data
  totalFiles.value = totalSelectedRoms.value;
  filesProcessed.value = 0;
  progressPercent.value = 0;
  currentFile.value = "";

  setTimeout(() => {
    syncPhase.value = "syncing";
    startMockProgress();
  }, 2000);
};

// Mock progress simulation
const mockFiles = [
  "Super Mario Bros.nes",
  "Metal Slug X.bin",
  "Sonic the Hedgehog.md",
  "Street Fighter II.sfc",
  "Crash Bandicoot.bin",
  "Final Fantasy VII.bin",
  "Pokemon Red.gb",
  "Legend of Zelda.nes",
  "Metroid.nes",
  "Contra.nes",
];

const startMockProgress = () => {
  const interval = setInterval(() => {
    if (syncPhase.value !== "syncing") {
      clearInterval(interval);
      return;
    }

    filesProcessed.value++;
    progressPercent.value = Math.round(
      (filesProcessed.value / totalFiles.value) * 100,
    );
    currentFile.value = mockFiles[filesProcessed.value % mockFiles.length];

    if (filesProcessed.value >= totalFiles.value) {
      clearInterval(interval);
      syncPhase.value = "done";
      syncSuccess.value = true;
    }
  }, 800); // Update every 800ms for demo
};

const cancelSync = () => {
  confirm.require({
    header: "Cancel sync?",
    message:
      "Files already copied will remain on your device, but the sync won't complete. You'll need to start over to sync the remaining ROMs.",
    rejectProps: {
      label: "Keep syncing",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Cancel sync",
      severity: "danger",
    },
    accept: () => {
      syncPhase.value = "idle";
    },
  });
};

onMounted(async () => {
  device.value = await deviceStore.loadDeviceById(props.deviceId);
  console.log(device.value);
});
</script>

<style lang="less" scoped>
.device-view {
  .error {
    color: var(--p-red-500);
  }
  .success {
    color: var(--p-green-500);
  }

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

.sync-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: 1rem;
}

.progress-bar {
  &__header {
    display: flex;
    align-items: center;

    &-title {
      flex: 1 0 auto;
      // Match the height of the icon button so when we switch to an icon on
      // error or success the sizing doesn't shift.
      line-height: 35px;
    }

    &-info,
    &-action {
      flex: 0 0 auto;
    }
  }

  &__footer {
    margin-top: var(--space-4);
    color: var(--p-text-muted-color);
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
}
</style>
