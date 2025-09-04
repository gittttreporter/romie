<template>
  <div class="app-toolbar">
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import AppSettingsModal from "@/components/AppSettingsModal.vue";

const settingsModal = ref();
</script>

<style scoped lang="less">
.app-toolbar {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;

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
  :deep(.p-iconfield) {
    z-index: var(--z-index-ui-elements);
    -webkit-app-region: no-drag;
  }
}
</style>
