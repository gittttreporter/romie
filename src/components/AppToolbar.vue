<template>
  <div class="app-toolbar">
    <div class="app-toolbar__messages">
      <Message
        v-if="updateAvailable"
        class="app-toolbar__update-message"
        severity="info"
        size="small"
        @click="handleUpdate"
      >
        {{ updateAvailable }} is ready! Click here to restart and install the
        update.
      </Message>
    </div>
    <div class="app-toolbar__tools">
      <div class="app-toolbar__actions">
        <slot name="actions" />
      </div>
      <div class="app-toolbar__search">
        <slot name="search" />
      </div>
      <div class="app-toolbar__settings">
        <slot name="settings">
          <Button
            class="app-toolbar__item"
            icon="pi pi-cog"
            size="small"
            severity="secondary"
            aria-label="Filters"
            @click="settingsModal.show()"
          />
        </slot>
      </div>
      <AppSettingsModal ref="settingsModal" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import Button from "primevue/button";
import Message from "primevue/message";
import AppSettingsModal from "@/components/AppSettingsModal.vue";

const settingsModal = ref();
const updateAvailable = ref<string | null>(null);
let unsubscribeUpdates: (() => void) | null = null;

onMounted(() => {
  unsubscribeUpdates = window.update.onUpdateAvailable((version) => {
    updateAvailable.value = version;
  });
});

onBeforeUnmount(() => {
  if (unsubscribeUpdates) unsubscribeUpdates();
});

function handleUpdate() {
  window.update.quitAndInstall();
}
</script>

<style scoped lang="less">
.app-toolbar {
  &__update-message {
    position: relative;
    cursor: pointer;
    user-select: none;
  }
  &__messages {
    .p-message {
      border-radius: 0;
    }
  }
  &__tools {
    padding: var(--space-6) var(--space-10);
    display: flex;
    align-items: center;
    gap: 8px;

    // Specific spacing to align the update action with the page content.
    padding-left: 8px;
  }

  &__actions {
    flex: 1;
  }

  /* All interactive elements need to be above the drag region */
  :deep(button),
  :deep(input),
  :deep(select),
  :deep(.p-button),
  :deep(.p-inputtext),
  :deep(.p-dropdown),
  :deep(.p-iconfield),
  &__update-message {
    z-index: var(--z-index-ui-elements);
    -webkit-app-region: no-drag;
  }
}
</style>
