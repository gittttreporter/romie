<template>
  <div class="rom-import">
    <div class="rom-import__header">
      <h1>
        ROM Import
        <span class="subtitle">Upload ROM files to your library</span>
      </h1>
      <div class="rom-import__actions">
        <Button
          size="large"
          severity="secondary"
          icon="pi pi-file-import"
          :disabled="isLoading"
          :label="buttonLabel"
          @click="handleImport"
          :loading="isLoading"
        />
        <div class="rom-import__supported-info">
          <strong>Supported file extensions:</strong> .nes, .sfc, .gb, .gba,
          .bin, .iso, .cue, .a26
        </div>
      </div>
    </div>
    <div v-if="!isLoading && result" class="rom-import__results">
      <div class="rom-import__results-summary">
        <h3 v-if="result.successes > 0" class="rom-import__result-header">
          <i class="pi pi-check-circle success-icon"></i>
          {{ result.successes }} out of {{ result.total }} ROM{{
            result.successes === 1 ? "" : "s"
          }}
          were added successfully
        </h3>
        <h3 v-else class="rom-import__result-header">
          <i class="pi pi-times error-icon"></i>
          No ROMs were imported successfully
        </h3>
      </div>

      <div
        v-if="result.warnings.length > 0"
        class="rom-import__results-summary"
      >
        <h3 class="rom-import__result-header">
          <i class="pi pi-exclamation-triangle warning-icon"></i>
          {{ result.warnings.length }}
          {{ result.warnings.length === 1 ? "duplicate" : "duplicates" }}
          ignored
          <span class="subtitle"
            >Duplicates detected by file content check (MD5 hash)</span
          >
        </h3>
        <div class="rom-import__result-content">
          <ul>
            <li v-for="message in result.warnings" :key="message">
              {{ message }}
            </li>
          </ul>
        </div>
      </div>

      <div v-if="result.errors.length > 0" class="rom-import__results-summary">
        <h3 class="rom-import__result-header">
          <i class="pi pi-exclamation-circle error-icon"></i>
          {{ result.errors.length }}
          {{ result.errors.length === 1 ? "file" : "files" }} could not be
          imported
        </h3>
        <div class="rom-import__result-content">
          <ul>
            <li v-for="message in result.errors" :key="message">
              {{ message }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import log from "electron-log";
import { ref, computed } from "vue";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { useRomStore } from "@/stores";

import type { RomImportResult } from "@/types/electron-api";

const romStore = useRomStore();
const toast = useToast();
const isLoading = ref(false);

const result = ref<{
  errors: string[];
  warnings: string[];
  successes: number;
  total: number;
} | null>(null);

const buttonLabel = computed(() => {
  if (isLoading.value) return "Processing files...";

  return "Import";
});

async function handleImport() {
  isLoading.value = true;
  result.value = null;

  try {
    const result = await romStore.importRom();

    processImportResult(result);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Sorry, something went wrong",
      detail: "We couldn’t complete the import. Please try again.",
      life: 4000,
    });
  } finally {
    isLoading.value = false;
  }
}

function processImportResult(importResult: RomImportResult) {
  log.info("files", importResult);
  if (importResult.canceled) return;

  const errors: string[] = [];
  const warnings: string[] = [];

  importResult.failed.forEach((error) => {
    if (error.reason.includes("already exists (duplicate of")) {
      const fileName = error.file.split(/[/\\]/).pop() || error.file;

      warnings.push(fileName);
    } else {
      errors.push(error.reason);
    }
  });

  result.value = {
    successes: importResult.imported.length,
    errors,
    warnings,
    total: importResult.imported.length + importResult.failed.length,
  };
}
</script>

<style scoped lang="less">
.rom-import {
  padding: 2rem;
  height: 100%;
  overflow: auto;

  h1,
  h3 {
    .subtitle {
      display: block;
      font-size: var(--font-size-md);
      font-weight: 400;
      color: var(--p-text-muted-color);
      margin-top: 0.25em;
    }
  }

  &__supported-info {
    color: var(--p-text-muted-color);
    font-size: var(--font-size-sm);
    max-width: 275px;
    margin-top: 6px;
  }

  &__results {
    margin-top: 2rem;
  }

  &__results-summary {
    margin-top: 1rem;

    .pi {
      margin-right: 4px;
    }

    .success-icon {
      color: var(--p-green-400);
    }

    .warning-icon {
      color: var(--p-yellow-400);
    }

    .error-icon {
      color: var(--p-red-400);
    }
  }
}
</style>
