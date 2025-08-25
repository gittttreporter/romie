<template>
  <div class="rom-import">
    <div class="rom-import__header">
      <h1>
        ROM Import
        <span class="subtitle">Upload ROM files to your library</span>
      </h1>
      <div class="rom-import__actions">
        <Button
          class="rom-import__import-button"
          size="large"
          severity="secondary"
          icon="pi pi-file-import"
          :label="importLabel"
          :loading="processingState === 'importing'"
          :disabled="isProcessing"
          @click="handleImport"
        />
        <Button
          size="large"
          severity="secondary"
          icon="pi pi-search-plus"
          :label="scanLabel"
          :loading="processingState === 'scanning'"
          :disabled="isProcessing"
          @click="handleScan"
        />
        <div class="rom-import__supported-info">
          <strong>Supported file extensions:</strong> {{ supportedExtensions }}
        </div>
      </div>
    </div>
    <div v-if="isProcessing" class="rom-import__progress">
      <span v-if="currentFile">
        <i class="pi pi-file"></i>
        Processing {{ currentFile }}...
      </span>
      <span v-else>Preparing files...</span>
    </div>
    <div v-if="!isProcessing && result" class="rom-import__results">
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
import log from "electron-log/renderer";
import { ref, computed } from "vue";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { useRomStore } from "@/stores";
import { getAllSupportedExtensions } from "@/utils/systems";

import type { RomImportResult } from "@/types/electron-api";

const romStore = useRomStore();
const toast = useToast();
const processingState = ref<"idle" | "importing" | "scanning">("idle");
const currentFile = ref("");

const result = ref<{
  errors: string[];
  warnings: string[];
  successes: number;
  total: number;
} | null>(null);

const supportedExtensions = getAllSupportedExtensions().join(", ");

const isProcessing = computed(() => processingState.value !== "idle");

const importLabel = computed(() => {
  if (processingState.value === "importing") return "Processing files...";
  return "Import";
});

const scanLabel = computed(() => {
  if (processingState.value === "scanning") return "Scanning directory...";
  return "Scan folder";
});

function showGenericError(operation: string) {
  toast.add({
    severity: "error",
    summary: "Sorry, something went wrong",
    detail: `We couldn't complete the ${operation}. Please try again.`,
    life: 4000,
  });
}

async function handleImport() {
  processingState.value = "importing";
  result.value = null;
  currentFile.value = "";

  const unsubscribeImportStatus = window.rom.onImportProgress((status) => {
    currentFile.value = status.currentFile;
  });

  try {
    const result = await romStore.importRom();
    processImportResult(result);
  } catch (error) {
    showGenericError("import");
  } finally {
    processingState.value = "idle";
    unsubscribeImportStatus();
  }
}

async function handleScan() {
  processingState.value = "scanning";
  result.value = null;
  currentFile.value = "";

  const unsubscribeImportStatus = window.rom.onImportProgress((status) => {
    currentFile.value = status.currentFile;
  });

  try {
    const result = await romStore.scanRomDir();
    processImportResult(result);
  } catch (error) {
    showGenericError("scan");
  } finally {
    processingState.value = "idle";
    unsubscribeImportStatus();
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
    successes: importResult.totalProcessed
      ? importResult.totalProcessed - errors.length - warnings.length
      : importResult.imported.length,
    errors,
    warnings,
    total: importResult.totalProcessed
      ? importResult.totalProcessed
      : importResult.imported.length + importResult.failed.length,
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

  &__import-button {
    margin-right: 1rem;
  }

  &__supported-info {
    color: var(--p-text-muted-color);
    font-size: var(--font-size-sm);
    max-width: 275px;
    margin-top: 6px;
  }

  &__progress,
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
