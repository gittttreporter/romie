<template>
  <main class="app-layout">
    <!-- Invisible draggable area at the top -->
    <div class="app-layout__draggable-area"></div>

    <div class="app-layout__main">
      <AppSidebar class="app-layout__main-sidebar"/>
      <div class="app-layout__main-content">
        <slot />
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<style lang="less" scoped>
@title-bar-height: 30px;

.app-layout {
  height: 100vh;
  background-color: #121212;
  color: #f2f2f2;
  box-sizing: border-box;

  &__draggable-area {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: @title-bar-height;
    -webkit-app-region: drag;
    z-index: 1000;
    background: transparent;
  }

  &__main {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  &__main-sidebar {
    padding-top: 30px;
  }

  &__main-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }
}
</style>
