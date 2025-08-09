<template>
  <div class="device-view">{{ deviceId }}</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  deviceId: string;
}>();
</script>
