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
        <InputText
          ref="tagInput"
          type="text"
          size="small"
          :maxlength="24"
          :auto-focus="true"
          v-model="tagDraft"
          @keydown.enter="handleTagAdded"
        />
        <Button
          icon="pi pi-check"
          text
          size="small"
          severity="success"
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
      <div v-else class="tags-editor_trigger">
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
import { ref, nextTick } from "vue";
import Button from "primevue/button";
import Chip from "primevue/chip";
import InputText from "primevue/inputtext";
import { normalizeInput } from "@/utils/string.utils";

const props = defineProps<{
  tags: string[];
  disabled?: boolean;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: "update", tags: string[]): void;
}>();

const tagInput = ref();
const tagDraft = ref("");
const isAddingTag = ref(false);

function showTagInput() {
  isAddingTag.value = true;
  nextTick(() => tagInput.value.$el.focus());
}

function handleTagAdded() {
  const newTag = normalizeInput(tagDraft.value);
  const exists = props.tags.some(
    (tag) => tag.toLowerCase() === newTag.toLowerCase(),
  );

  if (newTag !== "" && !exists) {
    emit("update", [...props.tags, tagDraft.value]);
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
  console.log("Tag removed:", tag);
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
}
</style>
