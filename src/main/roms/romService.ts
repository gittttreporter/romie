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

  // Process all selected ROM files
  filePaths.forEach((filePath) => {
    fileTasks.push(processRomFile(filePath))
  })

  // Handle processing results
  const results = await Promise.allSettled(fileTasks)
  const response: ImportResult = { imported: [], failed: [] };
  results.forEach((res) => {
    if (res.status === 'fulfilled') {
      response.imported.push(res.value)
    } else {
      response.failed.push({
        file: res.reason?.file || 'unknown',
        reason: res.reason?.reason || 'Unknown error',
      })
    }
  })

  return response;
}

// FUTURE SERVICES
//
// export async function listRoms(): Promise<RomMetadata[]> { ... }

// export async function getRom(id: string): Promise<RomMetadata | null> { ... }

// export async function removeRom(id: string): Promise<boolean> { ... }

// export async function updateRom(id: string, changes: Partial<RomMetadata>): Promise<RomMetadata> { ... }
