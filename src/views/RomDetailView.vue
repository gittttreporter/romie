<template>
  <div v-if="rom" class="rom-details">
    <Card class="rom-details__card">
      <template #title>
        <div class="rom-details__title">
          <span>{{ rom.displayName }}</span>
          <div class="rom-details__title-actions">
            <Button
              severity="secondary"
              variant="text"
              rounded
              aria-label="Favorite"
              :disabled="deleting"
              :loading="updating"
              :icon="rom.favorite ? 'pi pi-heart-fill' : 'pi pi-heart'"
              @click="handleFavorite"
            />
          </div>
        </div>
      </template>
      <template #subtitle>{{ systemDisplayName }}</template>
      <template #content>
        <div class="rom-details__content">
          <ul class="rom-details__metadata">
            <li
              class="rom-details__metadata-item"
              v-for="{ label, value } in romMetadata"
            >
              <span class="rom-details__metadata-label">{{ label }}:</span>
              <span class="rom-details__metadata-value">{{ value }}</span>
            </li>
          </ul>
          <div class="rom-details__tags">
            <TagsEditor :tags="rom?.tags || []" @update="handleTagUpdate" />
          </div>
          <div class="rom-details__actions">
            <Button
              severity="danger"
              label="Delete"
              icon="pi pi-trash"
              size="small"
              :rounded="true"
              :fluid="true"
              :disabled="updating"
              :loading="deleting"
              @click="handleDelete"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import { useToast } from "primevue/usetoast";
import { useRomStore } from "@/stores";
import { getSystemDisplayName } from "@/utils/system.utils";
import TagsEditor from "@/components/TagsEditor.vue";

const props = defineProps<{
  romId: string;
}>();
const emit = defineEmits<{
  (e: "delete"): void;
  (e: "favorite", favorite: boolean): void;
}>();
const romStore = useRomStore();
const toast = useToast();

const deleting = ref(false);
const updating = ref(false);

const rom = computed(() => romStore.getRomById(props.romId));
const systemDisplayName = computed(() =>
  rom.value ? getSystemDisplayName(rom.value.system) : null,
);
const romMetadata = computed(() =>
  rom.value
    ? [
        { label: "Size", value: formatSize(rom.value.size) },
        { label: "Region", value: rom.value.region },
        { label: "Imported on", value: formatDatetime(rom.value.importedAt) },
        { label: "Filename", value: rom.value.originalFilename },
      ]
    : [],
);

async function handleTagUpdate(tags: string[]) {
  updating.value = true;

  try {
    await romStore.updateRom(props.romId, { tags });
  } catch (error) {
    console.error("Failed to update tags:", error);
  } finally {
    updating.value = false;
  }
}

async function handleFavorite() {
  const favorite = !rom.value?.favorite;
  updating.value = true;

  try {
    await romStore.updateRom(props.romId, { favorite });
  } catch (error) {
    console.error("Failed to update favorite:", error);
  } finally {
    updating.value = false;
  }

  emit("favorite", favorite);
}

async function handleDelete() {
  const romName = rom.value?.displayName || "Unknown";
  deleting.value = true;

  try {
    await romStore.removeRom(props.romId);

    toast.add({
      severity: "success",
      summary: "Delete Successful",
      detail: `Deleted ${romName}`,
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Delete Failed",
      detail: `Failed to delete ${romName}`,
      life: 4000,
    });
  } finally {
    deleting.value = false;
  }

  emit("delete");
}

// Helpers for formatting
function formatSize(size: number): string {
  if (size < 1024) return size + " bytes";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(2) + " MB";
}

function formatDatetime(ts: number): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts);

  const now = new Date();
  const diffMs = now.getTime() - ts;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Same week (within past 6 days, not today)
  if (diffDays > 0 && diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  // Today
  if (
    now.getFullYear() === d.getFullYear() &&
    now.getMonth() === d.getMonth() &&
    now.getDate() === d.getDate()
  ) {
    return "Today";
  }

  // This year
  if (now.getFullYear() === d.getFullYear()) {
    return d.toLocaleDateString(undefined, { month: "long", day: "numeric" }); // "January 5"
  }

  // Previous years
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }); // "Jan 5, 2024"
}
</script>

<style scoped lang="less">
.rom-details {
  width: 350px;
  height: 100%;
  padding: 12px;

  &__card {
    height: 100%;
  }

  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-actions {
      align-self: flex-start;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__metadata {
    list-style: none;
    padding: 0;
    margin: 0;
    margin-top: 20px;

    &-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      gap: 8px;
      flex-wrap: wrap;
    }

    &-label {
      text-transform: uppercase;
      font-size: 12px;
      opacity: 0.6;
    }

    &-value {
      font-size: 14px;
    }
  }

  &__actions {
    margin-top: 16px;
  }
}
</style>
