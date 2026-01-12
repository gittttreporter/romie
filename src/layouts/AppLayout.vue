<template>
  <main class="app-layout">
    <!-- Invisible draggable area at the top -->
    <div class="app-layout__draggable-area"></div>

    <Splitter
      class="app-layout__main"
      :gutter-size="2"
      state-key="r_sidebar_size"
      state-storage="local"
    >
      <SplitterPanel class="app-layout__main-sidebar" :size="0" :min-size="18">
        <AppSidebar />
      </SplitterPanel>
      <SplitterPanel>
        <slot />
      </SplitterPanel>
    </Splitter>
    <Toast position="bottom-right" />
    <ConfirmDialog style="max-width: 400px" />
  </main>
</template>
<script setup lang="ts">
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import AppSidebar from '@/components/AppSidebar.vue';
</script>

<style lang="less" scoped>
@title-bar-height: 30px;

.app-layout {
  height: 100vh;
  box-sizing: border-box;

  &__draggable-area {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: @title-bar-height;
    -webkit-app-region: drag;
    z-index: var(--z-index-draggable-area);
    background: transparent;
  }

  &__main {
    display: flex;
    height: 100vh;
    overflow: hidden;

    &-sidebar {
      max-width: 350px;
    }
  }

  &__main-content {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
