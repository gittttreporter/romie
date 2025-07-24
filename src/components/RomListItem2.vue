<template>
  <div
    class="rom-row"
    @click="handleClick"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div class="rom-info">
      <span class="title">{{ name }}</span>
      <span class="meta">
        {{ console }} <span class="dot">•</span> {{ region }}
        <span class="dot">•</span> {{ formattedDate }}
        <span class="dot">•</span>
        {{ formattedSize }}
      </span>
    </div>
    <div class="rom-actions">
      <button
        v-if="hovered"
        class="delete-btn"
        @click.stop="handleDelete"
        aria-label="Delete ROM"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  id: string;
  name: string;
  console: string;
  region: string;
  size: number;
  dateAdded: string; // ISO string or raw Date-compatible value
}>();
const emit = defineEmits<{
  (e: "remove", id: string): void;
}>();

// State
// ------
const hovered = ref<boolean>(false);

// Computed
// --------
const formattedSize = computed(() => formatSize(props.size));
const formattedDate = computed(() => formatDate(props.dateAdded));

// Methods
// -------

function formatDate(dateAdded: string): string {
  const date = new Date(dateAdded);
  const now = new Date();
  const isSameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(isSameYear ? {} : { year: "numeric" }),
  });
}

function formatSize(size: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

function handleClick(): void {
  console.log(`Open ROM: ${props.name}`);
}

function handleDelete(): void {
  console.log(`Delete ROM: ${props.name}`);
  emit("remove", props.id);
}
</script>

<style scoped lang="less">
.rom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .rom-info {
    display: flex;
    flex-direction: column;

    .title {
      font-weight: 600;
      color: #f2f2f2;
    }

    .meta {
      font-size: 0.75rem;
      color: #aaa;
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      align-items: center;

      .dot {
        color: #555;
        font-size: 0.75rem;
      }
    }
  }

  .delete-btn {
    background: none;
    border: none;
    box-shadow: none;
    color: #888;
    font-size: 1rem;
    cursor: pointer;
    transition: color 0.2s ease;
    padding: 0.25rem;

    &:hover {
      color: #ff2d55;
    }
  }
}
</style>
