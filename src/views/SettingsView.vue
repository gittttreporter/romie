<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>Settings</h1>
      <p class="settings-description">Configure ROMie preferences</p>
    </div>

    <div class="settings-content">
      <div class="settings-section">
        <h2 class="section-title">Library</h2>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">ROM Storage Location</label>
            <p class="setting-description">Where ROMs are stored locally</p>
          </div>
          <div class="setting-control">
            <button class="browse-btn" @click="browseStorageLocation">
              Browse...
            </button>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Auto-organize imports</label>
            <p class="setting-description">Automatically organize ROMs by system</p>
          </div>
          <div class="setting-control">
            <input type="checkbox" v-model="autoOrganize" class="setting-checkbox" />
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">Appearance</h2>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Theme</label>
            <p class="setting-description">Choose light or dark theme</p>
          </div>
          <div class="setting-control">
            <select v-model="selectedTheme" class="setting-select">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">Sync</h2>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Default device profile</label>
            <p class="setting-description">Default profile for new devices</p>
          </div>
          <div class="setting-control">
            <select v-model="defaultProfile" class="setting-select">
              <option value="onion-os">Onion OS</option>
              <option value="stock-os">Stock OS</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">About</h2>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Version</label>
            <p class="setting-description">ROMie v1.0.0</p>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <button class="link-btn" @click="checkForUpdates">
              Check for Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Placeholder settings data
const autoOrganize = ref(true)
const selectedTheme = ref('system')
const defaultProfile = ref('onion-os')
const storageLocation = ref('')

// Placeholder methods
const browseStorageLocation = () => {
  // TODO: Open file dialog to select storage location
  console.log('Browse for storage location')
}

const checkForUpdates = () => {
  // TODO: Check for app updates
  console.log('Checking for updates...')
}

const saveSettings = () => {
  // TODO: Save settings to store/config
  console.log('Saving settings...')
}

const resetSettings = () => {
  // TODO: Reset settings to defaults
  console.log('Resetting settings...')
}
</script>

<style scoped lang="less">
.settings-view {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;

  .settings-header {
    margin-bottom: 32px;
  }

  h1 {
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--text-color);
  }

  .settings-description {
    color: var(--text-color-secondary);
    margin: 0;
    font-size: 16px;
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: var(--text-color);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--surface-300, #d1d5db);
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid var(--surface-200, #e5e7eb);

    &:last-child {
      border-bottom: none;
    }

    .setting-info {
      flex: 1;

      .setting-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-color);
        margin-bottom: 4px;
      }

      .setting-description {
        font-size: 13px;
        color: var(--text-color-secondary);
        margin: 0;
        line-height: 1.4;
      }
    }

    .setting-control {
      margin-left: 24px;
      min-width: 120px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

.browse-btn, .link-btn {
  background: var(--surface-100, #f5f5f7);
  color: var(--text-color);
  border: 1px solid var(--surface-300, #d1d5db);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--surface-200, #e5e7eb);
  }
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary-color, #007aff);
  padding: 0;

  &:hover {
    background: none;
    text-decoration: underline;
  }
}

.setting-select {
  background: var(--surface-100, #f5f5f7);
  color: var(--text-color);
  border: 1px solid var(--surface-300, #d1d5db);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: var(--primary-color, #007aff);
    box-shadow: 0 0 0 2px var(--primary-color-alpha, rgba(0, 122, 255, 0.2));
  }
}

.setting-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color, #007aff);

  &:focus {
    outline: 2px solid var(--primary-color-alpha, rgba(0, 122, 255, 0.2));
    outline-offset: 2px;
  }
}

@media (max-width: 600px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .setting-control {
      margin-left: 0;
      align-self: stretch;
    }

    .setting-select {
      width: 100%;
    }
  }
}

@media (prefers-color-scheme: dark) {
  .browse-btn {
    background: #2c2c2e;
    border-color: #38383a;
    color: #ffffff;

    &:hover {
      background: #3a3a3c;
    }
  }

  .setting-select {
    background: #2c2c2e;
    border-color: #38383a;
    color: #ffffff;
  }

  .settings-section .section-title {
    border-bottom-color: #38383a;
  }

  .setting-item {
    border-bottom-color: #2c2c2e;
  }
}
</style>
