<template>
  <RomListItem
    v-for="rom in romStore.roms"
    :key="rom.id"
    :id="rom.id"
    :name="rom.displayName"
    :console="rom.system"
    :region="rom.region"
    :size="rom.size"
    :date-added="rom.importedAt"
    @remove="handleRemove"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRomStore } from '@/stores';
import RomListItem from '@/components/RomListItem.vue'

// Get the store
const romStore = useRomStore()

// Load ROMs when component mounts
onMounted(async () => {
  await romStore.loadRoms()
})

// Methods
//--------
function handleRemove (id: string): void {
  romStore.removeRom(id)
}
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
