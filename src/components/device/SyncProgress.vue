<template>
  <Card class="sync-progress-card">
    <template #title>{{ title }}</template>
    <template #subtitle>
      <slot name="subtitle" />
    </template>
    <template #content>
      <div class="sync-progress">
        <div class="progress-bar">
          <div class="progress-bar__header">
            <div class="progress-bar__header-title">
              <span v-if="syncStatus.phase === 'preparing'">
                Preparing for sync...
              </span>
              <span v-else-if="syncStatus.phase === 'copying'">
                Copying: {{ syncStatus.currentFile }}
              </span>
              <span v-else-if="syncStatus.phase === 'error'">
                Oops, something went wrong
              </span>
              <span v-else-if="syncStatus.phase === 'done'">
                Sync complete!
                <Button
                  v-if="
                    syncStatus.filesFailed.length > 0 ||
                    syncStatus.filesSkipped.length > 0
                  "
                  :label="showSyncResults ? 'Hide results' : 'Show results'"
                  severity="secondary"
                  size="small"
                  variant="text"
                  @click="emit('toggleSyncResults')"
                />
              </span>
            </div>
            <div class="progress-bar__header-action">
              <i v-if="syncError" class="pi pi-times error"></i>
              <i
                v-else-if="syncStatus.phase === 'done'"
                class="pi pi-check success"
              ></i>
              <Button
                v-else
                icon="pi pi-times"
                severity="secondary"
                variant="text"
                rounded
                aria-label="Cancel"
                @click="emit('cancelSync')"
              />
            </div>
          </div>
          <ProgressBar
            :mode="
              syncStatus.phase === 'preparing' ? 'indeterminate' : 'determinate'
            "
            :value="syncStatus.progressPercent"
          ></ProgressBar>
          <div class="progress-bar__footer">
            <div v-if="syncError" class="error">
              Sync hit a snag. Don't worry, your ROMs are safe - give it another
              shot?
            </div>
            <div v-else-if="syncStatus.phase === 'preparing'">
              Preparing files...
            </div>
            <div v-else-if="syncStatus.phase === 'copying'">
              {{ syncStatus.filesProcessed }} of
              {{ syncStatus.totalFiles }} files
            </div>
            <div
              class="progress-bar__sync-results"
              v-else-if="syncStatus.phase === 'done'"
            >
              <Message
                v-for="(message, index) in syncSummary"
                :key="index"
                :icon="message.icon"
                severity="secondary"
                size="small"
                variant="simple"
              >
                {{ message.text }}
              </Message>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from "primevue/card";
import ProgressBar from "primevue/progressbar";
import Button from "primevue/button";
import Message from "primevue/message";

import type { SyncStatus } from "@/types/electron-api";
import type { SyncSummaryMessage } from "@/types/sync";

const props = defineProps<{
  title: string;
  syncStatus: SyncStatus;
  syncSummary: SyncSummaryMessage[];
  syncError: string;
  showSyncResults: boolean;
}>();

const emit = defineEmits<{
  (e: "cancelSync"): void;
  (e: "toggleSyncResults"): void;
}>();
</script>

<style scoped lang="less">
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

  &__sync-results {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-top: var(--space-4);
  }
}
</style>
