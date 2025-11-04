import { RetroAchievementsConfig } from '@/types/settings';
import { defineStore } from 'pinia';
import { ref, readonly } from 'vue';

export const useFeatureFlagStore = defineStore('featureFlags', () => {
  const initialized = ref(false);
  const retroAchievements = ref(false);

  async function initialize() {
    try {
      const raConfig = await window.ra.getConfig();
      setRetroAchievements(raConfig);
    } catch (error) {
      console.warn('Failed to load feature flags:', error);
    } finally {
      initialized.value = true;
    }
  }
  function setRetroAchievements(raConfig: RetroAchievementsConfig | null) {
    retroAchievements.value = Boolean(raConfig?.username && raConfig.apiKey);
  }

  return {
    retroAchievements: readonly(retroAchievements),
    setRetroAchievements,
    initialized: readonly(initialized),
    initialize,
  };
});
