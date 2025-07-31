<template>
  <div class="loading-indicator">
    <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  message?: string;
}>();
</script>

<style scoped lang="less">
.loading-indicator {
  display: flex;
}
</style>
