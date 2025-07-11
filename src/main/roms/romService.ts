import { dialog } from 'electron'
import { processRomFile } from './romImport';
import { RomMetadata } from './rom.types';

type ImportResult = {
  imported: RomMetadata[]; // maybe just RomMetadata[] instead?
  failed: {
    file: string;
    reason: string;
  }[]
}

export async function importRoms(): Promise<ImportResult> {
  const {filePaths} = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
  const fileTasks: Promise<RomMetadata>[] = []
  const result: ImportResult = { imported: [], failed: [] };

  // Process all selected ROM files
  filePaths.forEach((filePath) => {
    fileTasks.push(processRomFile(filePath))
  })

  // Handle processing results
  const results = await Promise.allSettled(fileTasks)
  results.forEach((res) => {
    if (res.status === 'fulfilled') {
      result.imported.push(res.value)
    } else {
      result.failed.push({
        file: res.reason?.file || 'unknown',
        reason: res.reason?.reason || 'Unknown error',
      })
    }
  })

  // Store valid ROM metadata
  // insertRomMetadata(metadata)

  return result;
}

// FUTURE SERVICES
//
// export async function listRoms(): Promise<RomMetadata[]> { ... }

// export async function getRom(id: string): Promise<RomMetadata | null> { ... }

// export async function removeRom(id: string): Promise<boolean> { ... }

// export async function updateRom(id: string, changes: Partial<RomMetadata>): Promise<RomMetadata> { ... }
