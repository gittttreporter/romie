<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from "@/layouts/AppLayout.vue";
import { useFeatureFlagStore } from "./stores";

const ff = useFeatureFlagStore();

ff.initialize();
</script>
