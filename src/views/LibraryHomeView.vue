<template>
  <RomListItem
    v-for="rom in roms"
    :key="rom.id"
    :name="rom.displayName"
    :console="rom.system"
    :region="rom.region"
    :size="rom.size"
    :date-added="rom.importedAt"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import log from 'electron-log/renderer';
import RomListItem from '@/components/RomListItem.vue'

import type { Ref } from 'vue'
import type { Rom } from '@/types/rom' // Adjust path as needed

const roms: Ref<Rom[]> = ref([])
const loading: Ref<boolean> = ref(true)
const error: Ref<Error | null> = ref(null)

onMounted(async () => {
  try {
    log.info('Getting rom list..')
    roms.value = await window.rom.list()
    log.info(roms.value)
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Unknown error')
    log.error('Failed to load ROMs:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="less">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  color: #aaa;

  .emoji {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h2 {
    color: #f2f2f2;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    max-width: 320px;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  // TODO: Duplicated - Create common styles for standard elements.
  .primary-button {
    background-color: #ff2d55;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background-color: #ff3a66;
    }
  }
}
</style>
