<template>
  <div class="rom-bulk-actions">
    <Card class="rom-bulk-actions__card">
      <template #title>{{ romSelections.length }} roms selected</template>
      <template #content>
        <div class="rom-bulk-actions__card-content">
          <TagsEditor
            :tags="commonTags"
            @update="handleTagUpdate"
            :disabled="deleting"
            :loading="updating"
          />
          <Button
            severity="danger"
            label="Delete"
            icon="pi pi-trash"
            size="small"
            :rounded="true"
            :disabled="updating"
            :loading="deleting"
            @click="handleDelete"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, computed, ref } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import TagsEditor from "@/components/TagsEditor.vue";
import { useRomStore } from "@/stores";

const romStore = useRomStore();
const props = defineProps<{
  romSelections: string[];
}>();
const emit = defineEmits<{
  (e: "delete"): void;
}>();

const deleting = ref<boolean>(false);
const updating = ref<boolean>(false);

const commonTags = computed(() => {
  const romIds = props.romSelections;
  let intersection: Set<string> | null = null;

  if (romIds.length === 0) return [];

  for (const romId of props.romSelections) {
    const rom = romStore.getRomById(romId);
    const tags = rom?.tags ?? [];

    if (intersection === null) {
      intersection = new Set(tags);
    } else {
      intersection = new Set(tags.filter((tag) => intersection!.has(tag)));
    }

    // There's no need to continue if there are no common tags.
    if (intersection.size === 0) {
      break;
    }
  }

  return intersection ? Array.from(intersection) : [];
});

async function handleDelete() {
  const deletions = [];
  deleting.value = true;

  for (const romId of props.romSelections) {
    deletions.push(romStore.removeRom(romId));
  }

  try {
    await Promise.all(deletions);
  } catch (error) {
    console.error(error);
  } finally {
    deleting.value = false;
  }

  emit("delete");
}

async function handleTagUpdate(tags: string[]) {
  const updates = [];

  for (const romId of props.romSelections) {
    updates.push(romStore.updateRom(romId, { tags }));
  }

  try {
    await Promise.all(updates);
  } catch (error) {
    console.error(error);
  } finally {
    updating.value = false;
  }
}
</script>

<style scoped lang="less">
.rom-bulk-actions {
  width: 350px;
  height: 100%;
  padding: 16px;

  &__card {
    height: 100%;

    &-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
      margin-top: 16px;
    }
  }
}
</style>
