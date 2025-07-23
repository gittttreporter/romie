<template>
  <div class="rom-import">
    This is where you can import a rom file

    <Button label="Import" @click="handleImport" />
  </div>
</template>

<script setup lang="ts">
import log from "electron-log";
import Button from "primevue/button";
import { useRomStore } from "@/stores";

const romStore = useRomStore();

async function handleImport() {
  try {
    const result = await romStore.importRom();
    // TODO: process and show errors in RomImportResult
    log.info("files", result);
  } catch (error) {
    // TODO: Add UI for failure state.
    log.error(error);
  }
}
</script>
