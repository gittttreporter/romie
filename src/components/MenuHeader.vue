<template>
  <h4
    class="menu-header"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    {{ title }}
    <div v-if="action && isHovered" class="menu-header__actions">
      <Button
        class="action-btn"
        :icon="action.icon"
        severity="secondary"
        variant="text"
        rounded
        @click="action.onClick"
      />
    </div>
  </h4>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";

const props = defineProps<{
  title: string;
  action?: {
    icon: string;
    onClick: () => void;
  };
}>();

const isHovered = ref(false);
</script>

<style scoped lang="less">
.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--p-navigation-submenu-label-color);
  margin: 0 20px 8px 16px;
  padding: 0;
  user-select: none;
  position: relative;

  &__actions {
    position: absolute;
    right: 0;

    .action-btn {
      height: 1.75rem;
      width: 1.75rem;
    }
  }
}
</style>
