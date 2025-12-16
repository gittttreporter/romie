<template>
  <div class="rom-bulk-actions">
    <Card class="rom-bulk-actions__card">
      <template #title>{{ romSelections.length }} games selected</template>
      <template #content>
        <div class="rom-bulk-actions__card-content">
          <TagsEditor
            :tags="commonTags"
            :disabled="deleting"
            :loading="updating"
            @update="handleTagUpdate"
          />
          <Button
            severity="danger"
            label="Delete"
            icon="pi pi-trash"
            size="small"
            :rounded="true"
            :disabled="updating"
            :loading="deleting"
            @click="confirmDelete"
          />
        </div>
      </template>
    </Card>
    <ConfirmPopup></ConfirmPopup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import TagsEditor from '@/components/TagsEditor.vue';
import { useRomStore } from '@/stores';

const romStore = useRomStore();
const confirm = useConfirm();
const toast = useToast();

const props = defineProps<{
  romSelections: string[];
}>();
const emit = defineEmits<{
  (e: 'delete', deleted: number, failed: number): void;
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

function confirmDelete(event: MouseEvent) {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: `Are you sure you want to delete ${props.romSelections.length} ROM(s)?`,
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Do it',
      severity: 'danger',
    },
    accept: handleDelete,
  });
}
function showDeleteToast(successCount: number, failureCount: number) {
  if (successCount && !failureCount) {
    toast.add({
      severity: 'success',
      summary: 'Delete Successful',
      detail: successCount === 1 ? 'Deleted 1 ROM' : `Deleted ${successCount} ROMs`,
      life: 3000,
    });
  } else if (successCount && failureCount) {
    toast.add({
      severity: 'warn',
      summary: 'Partial Delete',
      detail: `Deleted ${successCount} ROM(s), but ${failureCount} failed.`,
      life: 4000,
    });
  } else if (failureCount) {
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: `Failed to delete ${failureCount} ROM(s).`,
      life: 4000,
    });
  }
}

async function handleDelete() {
  const deletions = [];
  deleting.value = true;

  for (const romId of props.romSelections) {
    deletions.push(romStore.removeRom(romId));
  }

  const results = await Promise.allSettled(deletions);
  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  showDeleteToast(succeeded, failed);

  deleting.value = false;

  emit('delete', succeeded, failed);
}

async function handleTagUpdate(newTags: string[]) {
  updating.value = true;

  const oldTags = commonTags.value;
  const addedTags = newTags.filter((tag) => !oldTags.includes(tag));
  const removedTags = oldTags.filter((tag) => !newTags.includes(tag));

  const updates = [];

  for (const romId of props.romSelections) {
    const rom = romStore.getRomById(romId);
    if (!rom) continue;

    const tagsToRemove = (rom.tags ?? []).filter((tag) => !removedTags.includes(tag));
    const tags = Array.from(new Set([...tagsToRemove, ...addedTags]));

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
