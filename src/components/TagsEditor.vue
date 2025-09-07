<template>
  <div class="tags-editor">
    <div v-if="tags.length > 0" class="tags-editor__tag-list">
      <Chip
        v-for="tag in tags"
        :key="tag"
        :label="tag"
        :removable="!(disabled || loading)"
        @remove="handleTagRemoved(tag)"
      ></Chip>
    </div>
    <div class="tags-editor__form">
      <div v-if="isAddingTag" class="tags-editor__input">
        <div class="tags-editor__input-row">
          <AutoComplete
            v-model="tagDraft"
            ref="tagInput"
            type="text"
            size="small"
            :invalid="!!tagError"
            :multiple="false"
            :suggestions="filteredTags"
            :complete-on-focus="true"
            :show-empty-message="false"
            placeholder="Enter tag"
            @complete="handleSearch"
            @keydown.enter="handleTagAdded"
          />

          <Button
            icon="pi pi-check"
            text
            size="small"
            severity="success"
            :disabled="!tagDraft.trim() || !!tagError"
            @click="handleTagAdded"
          />
          <Button
            icon="pi pi-times"
            text
            size="small"
            severity="secondary"
            @click="handleCancel"
          />
        </div>
        <Message
          v-if="tagError"
          severity="error"
          size="small"
          variant="simple"
          >{{ tagError }}</Message
        >
      </div>
      <div v-else class="tags-editor__trigger">
        <Button
          label="Add tag"
          icon="pi pi-plus"
          severity="secondary"
          size="small"
          :rounded="true"
          :disabled="disabled"
          :loading="loading"
          @click="showTagInput"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from "vue";
import AutoComplete from "primevue/autocomplete";
import Message from "primevue/message";
import Button from "primevue/button";
import Chip from "primevue/chip";
import { normalizeInput } from "@/utils/string.utils";
import { useRomStore } from "@/stores";

const props = defineProps<{
  tags: string[];
  disabled?: boolean;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: "update", tags: string[]): void;
}>();

const romStore = useRomStore();
const tagInput = ref();
const tagDraft = ref("");
const isAddingTag = ref(false);
const filteredTags = ref<string[]>([]);

const tagError = computed(() => {
  if (tagDraft.value.length > 24) {
    return "Max 24 characters";
  }

  return null;
});
const availableTags = computed(() => {
  return Object.values(romStore.stats.tagStats).map(({ tag }) => tag);
});

function showTagInput() {
  isAddingTag.value = true;
  nextTick(() => tagInput.value.$el.querySelector("input").focus());
}

function handleSearch(event: { query: string }) {
  const query = event.query.toLowerCase();

  filteredTags.value = availableTags.value.filter(
    (tag) => tag.toLowerCase().includes(query) && !props.tags.includes(tag),
  );
}

function handleTagAdded() {
  if (tagError.value) return;

  const newTag = normalizeInput(tagDraft.value);
  const exists = props.tags.some(
    (tag) => tag.toLowerCase() === newTag.toLowerCase(),
  );

  if (newTag !== "" && !exists) {
    emit("update", [...props.tags, newTag]);
  }

  tagDraft.value = "";
  isAddingTag.value = false;
}

function handleCancel() {
  tagDraft.value = "";
  isAddingTag.value = false;
}

function handleTagRemoved(tag: string) {
  const updatedTags = props.tags.filter((t) => t !== tag);
  emit("update", updatedTags);
}
</script>

<style scoped lang="less">
.tags-editor {
  &__tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  &__input {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>
