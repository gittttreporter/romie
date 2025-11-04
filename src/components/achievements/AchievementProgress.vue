<template>
  <div v-if="shouldShow" class="achievement-progress">
    <div class="achievement-progress__title">
      <Skeleton v-if="loading" width="200px" height="var(--font-size-sm)" />
      <div v-else class="achievement-progress__title-text">
        <strong>{{ numAchieved }}</strong> of <strong>{{ numAvailable }}</strong> achievements
      </div>
    </div>
    <Skeleton v-if="loading" width="100%" height="38px" />
    <MeterGroup v-else :value="value" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MeterGroup, { type MeterItem } from 'primevue/metergroup';
import Skeleton from 'primevue/skeleton';

const props = defineProps<{
  total?: number;
  numSoftcore?: number;
  numHardcore?: number;
  loading: boolean;
}>();

const formatter = new Intl.NumberFormat('en-US');

const numAchieved = computed(() =>
  formatter.format((props.numSoftcore || 0) + (props.numHardcore || 0))
);
const numAvailable = computed(() => formatter.format(props.total || 0));
const value = computed(() => {
  const getPercent = (num: number) => (props.total ? Math.floor((num / props.total) * 100) : 0);
  const meterItems: MeterItem[] = [
    {
      label: 'Softcore',
      color: 'var(--p-blue-500)',
      value: getPercent(props.numSoftcore || 0),
      icon: 'pi pi-trophy',
    },
  ];

  if (props.numHardcore && props.numHardcore > 0) {
    meterItems.push({
      label: 'Hardcore',
      color: 'var(--p-yellow-500)',
      value: getPercent(props.numHardcore),
      icon: 'pi pi-crown',
    });
  }

  return meterItems;
});
const shouldShow = computed(() => {
  if (props.loading) return true;
  const { total, numHardcore, numSoftcore } = props;

  // Only show achievement progress if we have valid numbers
  if (total !== undefined && numHardcore !== undefined && numSoftcore !== undefined) {
    return isFinite(total) && isFinite(numHardcore) && isFinite(numSoftcore);
  }

  return false;
});
</script>

<style scoped lang="less">
.achievement-progress {
  &__title {
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-4);
    color: var(--p-text-muted-color);

    &-text {
      line-height: var(--font-size-sm);
    }
  }
}
</style>
