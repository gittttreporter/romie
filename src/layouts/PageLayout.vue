<template>
  <div class="page-layout">
    <AppToolbar />
    <div class="page-layout__header">
      <h1>
        <slot name="title">
          {{ title }}
        </slot>
        <span class="subtitle">
          <slot name="subtitle">
            {{ subtitle }}
          </slot>
        </span>
      </h1>
    </div>
    <div v-if="$slots.messages" class="page-layout__messages">
      <slot name="messages"></slot>
    </div>
    <div class="page-layout__actions">
      <slot name="actions"></slot>
    </div>
    <div class="page-layout__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppToolbar from '@/components/AppToolbar.vue';
defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>

<style scoped lang="less">
.page-layout {
  padding-bottom: var(--space-16);
  height: 100%;
  overflow: auto;

  h1 {
    margin-top: 0;
  }

  h1,
  h3 {
    padding: 0 var(--space-10);

    .subtitle {
      display: block;
      font-size: var(--font-size-md);
      font-weight: 400;
      color: var(--p-text-muted-color);
      margin-top: 0.25em;
      max-width: 36rem;
    }
  }

  &__messages {
    margin-bottom: 1rem;
  }
  &__messages,
  &__content {
    padding: 0 var(--space-10);
  }
}
</style>
