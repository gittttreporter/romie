import { dialog } from 'electron'
import { processRomFile } from './romImport';
import type { Rom } from '@/types/rom';
import type { RomImportResult } from '@/types/electron-api';


export async function importRoms(): Promise<RomImportResult> {
  const {filePaths} = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
  const fileTasks: Promise<Rom>[] = []

  // Process all selected ROM files
  filePaths.forEach((filePath) => {
    fileTasks.push(processRomFile(filePath))
  })

  // Handle processing results
  const results = await Promise.allSettled(fileTasks)
  const response: RomImportResult = { imported: [], failed: [] };
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


// export async function getRom(id: string): Promise<Rom | null> { ... }

// export async function removeRom(id: string): Promise<boolean> { ... }

// export async function updateRom(id: string, changes: Partial<Rom>): Promise<Rom> { ... }
