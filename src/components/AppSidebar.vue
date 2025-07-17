<template>
  <aside class="sidebar">
    <div class="section actions">
      <input
        id="global-app-search"
        type="text"
        class="search-input"
        placeholder="Search ROMs..."
      />
      <button class="import-button primary-button" @click="handleImport">+ Import ROMs</button>
    </div>

    <div class="section">
      <div class="title">Library</div>
      <RouterLink class="item" to="/">Home</RouterLink>
      <RouterLink class="item" to="/favorites">Favorites</RouterLink>
    </div>

    <div class="section">
      <div class="title">Consoles</div>
      <RouterLink class="item" :to="{ name: 'console', params: { console: 'gba' } }">GBA</RouterLink>
      <RouterLink class="item" :to="{ name: 'console', params: { console: 'snes' } }">SNES</RouterLink>
      <RouterLink class="item" :to="{ name: 'console', params: { console: 'psx' } }">PSX</RouterLink>
    </div>

    <div class="section">
      <div class="title">Devices</div>
      <RouterLink class="item" :to="{ name: 'device', params: { device: 'miyoo' } }">Miyoo Mini+</RouterLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import log from 'electron-log/renderer';
import { useRomStore } from '@/stores';

const romStore = useRomStore();

async function handleImport() {
  try {
    const result = await romStore.importRom()
    // TODO: process and show errors in RomImportResult
    log.info('files', result)
  } catch (error) {
    // TODO: Add UI for failure state.
    log.error(error)
  }
}
</script>

<style scoped lang="less">
// TODO: Move this to main.less
.primary-button {
  display: inline-block;
  width: 100%;
  background-color: #ff2d55;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: #ff3a66;
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 45, 85, 0.4);
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.sidebar {
  width: 240px;
  background: #1c1c1e;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);

  .section {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
  }

  .title {
    font-size: 0.75rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
  }

  .item {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;
    font-size: 0.9rem;
    color: #f2f2f2;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    &.router-link-active {
      background: #3a3a3c;
      color: white;
    }
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: none;
    outline: none;
    font-size: 0.9rem;
    background: #2c2c2e;
    color: #f2f2f2;
    margin-bottom: 12px;

    &::placeholder {
      color: #888;
    }

    &:focus {
      background: #3a3a3c;
    }
  }
}
</style>
