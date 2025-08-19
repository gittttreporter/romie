import { ref, computed } from "vue";
import { useConfirm } from "primevue/useconfirm";
import type { SyncOptions, SyncStatus } from "@/types/electron-api";
import type { SyncSummaryMessage } from "@/types/sync";

export function useSyncLogic(deviceId: string) {
  const confirm = useConfirm();

  // State
  const syncError = ref("");
  const showSyncResults = ref(false);
  const syncStatus = ref<SyncStatus>({
    phase: "idle",
    totalFiles: 0,
    filesProcessed: 0,
    filesFailed: [],
    filesSkipped: [],
    progressPercent: 0,
  });

  // Smart summary messages
  const syncSummaryMessages = computed((): SyncSummaryMessage[] => {
    const status = syncStatus.value;
    const total = status.totalFiles;
    const failed = status.filesFailed.length;

    // Group skipped files by reason
    const skippedByReason = status.filesSkipped.reduce(
      (acc, skip) => {
        acc[skip.reason] = (acc[skip.reason] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const fileExists = skippedByReason.file_exists || 0;
    const unsupportedSystem = skippedByReason.unsupported_system || 0;
    const unsupportedFormat = skippedByReason.unsupported_format || 0;
    const totalSkipped = fileExists + unsupportedSystem + unsupportedFormat;
    const copied = total - totalSkipped - failed;

    if (total === 0) {
      return [
        {
          icon: "pi pi-info-circle",
          text: "No files found matching your criteria",
        },
      ];
    }

    const messages: SyncSummaryMessage[] = [];

    // All failed
    if (failed === total) {
      messages.push({
        icon: "pi pi-times",
        text: `All ${total} files failed to copy`,
      });
      messages.push({
        text: "No files were copied",
      });
      return messages;
    }

    // All skipped (any reason)
    if (totalSkipped === total) {
      if (fileExists === total) {
        messages.push({
          icon: "pi pi-minus-circle",
          text: `Skipped all ${total} files (already exist)`,
        });
      } else if (unsupportedSystem + unsupportedFormat === total) {
        messages.push({
          icon: "pi pi-exclamation-triangle",
          text: `Skipped all ${total} files (unsupported)`,
        });
      } else {
        messages.push({
          icon: "pi pi-minus-circle",
          text: `Skipped all ${total} files`,
        });
      }
      messages.push({
        text: "No new files to copy",
      });
      return messages;
    }

    // Show copied files if any
    if (copied > 0) {
      messages.push({
        icon: "pi pi-check",
        text: `Copied ${copied} files`,
      });
    }

    // Show skipped files by reason
    if (fileExists > 0) {
      messages.push({
        icon: "pi pi-minus-circle",
        text: `Skipped ${fileExists} (already exist)`,
      });
    }

    if (unsupportedSystem > 0) {
      messages.push({
        icon: "pi pi-exclamation-triangle",
        text: `Skipped ${unsupportedSystem} (unsupported system)`,
      });
    }

    if (unsupportedFormat > 0) {
      messages.push({
        icon: "pi pi-exclamation-triangle",
        text: `Skipped ${unsupportedFormat} (unsupported extension)`,
      });
    }

    // Show failed files if any
    if (failed > 0) {
      messages.push({
        icon: "pi pi-times",
        text: `${failed} failed to copy`,
      });
    }

    // Add summary message for successful cases
    if (failed === 0) {
      if (totalSkipped === 0) {
        messages.push({
          text: "All files copied successfully",
        });
      } else if (
        fileExists > 0 &&
        unsupportedSystem + unsupportedFormat === 0
      ) {
        messages.push({
          text: "All files processed successfully",
        });
      } else if (unsupportedSystem + unsupportedFormat > 0) {
        messages.push({
          text: "Check device profile for unsupported files",
        });
      }
    }

    return messages;
  });

  // Methods
  async function handleProgressUpdate(progress: SyncStatus) {
    syncStatus.value = progress;
  }

  async function startSync(selectedTagIds: string[], syncOptions: SyncOptions) {
    syncStatus.value.phase = "preparing";
    const unsubscribesyncStatus = window.sync.onProgress(handleProgressUpdate);

    try {
      syncStatus.value = await window.sync.start(selectedTagIds, deviceId, {
        cleanDestination: syncOptions.cleanDestination,
        verifyFiles: syncOptions.verifyFiles,
      });
    } catch (err) {
      syncError.value = (err as Error).message || "An unknown error occurred";
      syncStatus.value.phase = "error";
    } finally {
      unsubscribesyncStatus();
    }
  }

  function cancelSync() {
    confirm.require({
      header: "Cancel sync?",
      message:
        "Files already copied will remain on your device, but the sync won't complete. You'll need to start over to sync the remaining ROMs.",
      rejectProps: {
        label: "Keep syncing",
        severity: "secondary",
        outlined: true,
      },
      acceptProps: {
        label: "Cancel sync",
        severity: "danger",
      },
      accept: () => {
        window.sync.cancel();
      },
    });
  }

  return {
    // State
    syncError,
    syncStatus,
    showSyncResults,

    // Computed
    syncSummaryMessages,

    // Methods
    startSync,
    cancelSync,
    handleProgressUpdate,
  };
}
