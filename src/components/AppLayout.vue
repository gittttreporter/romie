<template>
  <main class="layout">
    <AppSidebar />
    <div class="content">
      <slot />
    </div>
  </main>
</template>

<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background-color: #121212;
  color: #f2f2f2;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
