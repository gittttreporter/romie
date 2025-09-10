<template>
  <div v-if="shouldShow" class="recent-achievements">
    <div class="recent-achievements__header">Recent Achievements</div>
    <div class="recent-achievements__item">
      <Skeleton
        v-if="!iconLoaded && !iconError"
        width="34px"
        height="34px"
        border-radius="var(--radius-sm)"
      />
      <img
        v-show="iconLoaded"
        class="recent-achievements__icon"
        :src="getBadgeUrl(recentAchievements[0]?.badgeName)"
        @load="iconLoaded = true"
        @error="iconError = true"
      />
      <Skeleton v-if="loading" height="34px" />
      <div
        v-else-if="recentAchievements[0]"
        class="recent-achievements__content"
      >
        <div class="recent-achievements__title">
          {{ recentAchievements[0].title }}
        </div>
        <div class="recent-achievements__description">
          {{ recentAchievements[0].description }}
        </div>
      </div>
    </div>
    <div class="recent-achievements__footer">
      {{ formatAchievementDate(recentAchievements[0]?.dateEarned) }}
    </div>
    <AvatarGroup>
      <template
        v-for="(achievement, idx) in recentAchievements"
        :key="achievement.id"
      >
        <Avatar
          v-if="idx > 0 && idx <= 4"
          v-bind="getAvatarOptions(achievement)"
          shape="circle"
          v-tooltip.bottom="`${achievement.title}: ${achievement.description}`"
          @error="avatarErrors[achievement.id] = true"
        />
        <Avatar
          v-else-if="idx === 5"
          :label="`+${recentAchievements.length - 5}`"
          shape="circle"
        />
      </template>
    </AvatarGroup>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import Avatar from "primevue/avatar";
import AvatarGroup from "primevue/avatargroup";
import Skeleton from "primevue/skeleton";
import type { GameExtendedAchievementEntityWithUserProgress } from "@retroachievements/api";

const props = defineProps<{
  loading: boolean;
  achievements?: Record<number, GameExtendedAchievementEntityWithUserProgress>;
}>();

const iconLoaded = ref(false);
const iconError = ref(false);
const avatarErrors = ref<Record<number, boolean>>({});

// https://media.retroachievements.org/Badge/384447.png
const recentAchievements = computed(() => {
  if (!props.achievements) return [];

  return Object.values(props.achievements)
    .filter((achievement) => achievement.dateEarned)
    .sort(
      (a, b) =>
        new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime(),
    );
});

const shouldShow = computed(
  () => props.loading || recentAchievements.value.length > 0,
);

function getAvatarOptions(
  achievement: GameExtendedAchievementEntityWithUserProgress,
) {
  if (avatarErrors.value[achievement.id] || !achievement.badgeName) {
    return {
      label: achievement.title?.charAt(0)?.toUpperCase() || "?",
    };
  }

  return {
    image: getBadgeUrl(achievement.badgeName),
  };
}

function getBadgeUrl(badgeName: string) {
  return `https://media.retroachievements.org/Badge/${badgeName}.png`;
}

function formatAchievementDate(dateEarned: string) {
  if (!dateEarned) return "";

  const date = new Date(dateEarned);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Recent achievements use relative time
  if (diffDays === 0) return "Achieved today";
  if (diffDays === 1) return "Achieved yesterday";
  if (diffDays < 7) return `Achieved ${diffDays} days ago`;

  // Exclude year for current year
  const currentYear = now.getFullYear();
  const achievementYear = date.getFullYear();

  return `Achieved ${date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    ...(currentYear !== achievementYear && { year: "numeric" }),
  })}`;
}
</script>

<style lang="less" scoped>
.recent-achievements {
  user-select: none;

  &__header {
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-4);
    color: var(--p-text-muted-color);
    font-weight: 600;
  }

  &__item {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-2);
  }

  &__footer {
    font-size: var(--font-size-xs);
    color: var(--p-text-muted-color);
    margin-bottom: var(--space-4);
  }

  &__icon {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    display: block;
    height: 34px;
    width: 34px;
    border-radius: var(--radius-sm);
  }

  &__content {
    flex: 1;
    min-width: 0;
    align-self: center;
  }

  &__title {
    font-size: var(--font-size-sm);
    color: var(--p-text-muted-color);
    line-height: var(--font-size-sm);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: var(--space-2);
  }
  &__description {
    font-size: var(--font-size-sm);
    color: var(--p-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
