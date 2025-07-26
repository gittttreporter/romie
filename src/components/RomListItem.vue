<template>
  <div class="rom-list-item" :class="{ 'rom-list-item--active': isActive }">
    <SystemBadge :code="system" />
    <div class="rom-list-item__content">
      <span class="rom-list-item__name">{{ name }}</span>
      <span class="rom-list-item__region">{{ region }}</span>
    </div>
    <div class="rom-list-item__actions"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from "vue";
import SystemBadge from "@/components/SystemBadge.vue";

import type { SystemCode } from "@/types/system";

const props = defineProps<{
  id: string;
  name: string;
  system: SystemCode;
  region: string;
  size: number;
  dateAdded: number; // ISO string or raw Date-compatible value
  isActive: boolean;
}>();
</script>

<style scoped lang="less">
.rom-list-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  margin: 0 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    cursor: pointer;
    background-color: #232323;
  }

  &--active {
    background-color: #333;
  }

  &__content {
    flex-grow: 1;
    display: flex;
    align-items: center;
  }

  &__name {
    font-weight: 500;
  }

  &__region {
    margin-left: 8px;
    font-size: 14px;
    opacity: 0.5; // TODO: Replace with secondarty color when implemented
  }

  &__actions {
    flex-shrink: 0;
    margin-left: auto;
  }
}
</style>
