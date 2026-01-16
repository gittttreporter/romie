<template>
  <div v-if="verified && ff.retroAchievements" class="rom-achievements">
    <AchievementProgress
      class="rom-achievements__progress"
      :loading="loading"
      :total="metadata?.numAchievements"
      :num-softcore="metadata?.numAwardedToUser"
      :num-hardcore="metadata?.numAwardedToUserHardcore"
    />
    <RecentAchievements :loading="loading" :achievements="metadata?.achievements" />
    <Button
      v-if="metadata?.id"
      class="rom-achievements__link"
      label="View on RetroAchievements"
      variant="link"
      size="small"
      icon="pi pi-external-link"
      icon-pos="right"
      @click="openRetroAchievementsPage"
    />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { useFeatureFlagStore } from '@/stores';
import AchievementProgress from './AchievementProgress.vue';
import RecentAchievements from './RecentAchievements.vue';

import type { GameInfoAndUserProgress } from '@retroachievements/api';

const props = defineProps<{
  verified: boolean;
  loading: boolean;
  metadata: GameInfoAndUserProgress | null;
}>();

const ff = useFeatureFlagStore();

function openRetroAchievementsPage() {
  const gameId = props.metadata?.id;
  if (!gameId) return;
  window.util.openExternalLink(`https://retroachievements.org/game/${gameId}`);
}
</script>

<style scoped lang="less">
.rom-achievements {
  display: flex;
  flex-direction: column;

  &__progress {
    margin-bottom: 16px;
  }

  &__link {
    align-self: flex-start;
    padding-left: 0;
  }
}
</style>
