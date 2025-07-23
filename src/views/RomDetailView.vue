<template>
  <div class="rom-detail-view">
    Specific information about the ROM {{ romId }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

// Props from route params
const route = useRoute();

const romId = computed(() => route.params.romId as string);
</script>

<style scoped lang="less">
.rom-detail-view {
}
</style>
