import type { Rom } from './rom'

export type RomImportResult = {
  imported: Rom[];
  failed: {
    file: string;
    reason: string;
  }[]
}

export interface RomApi {
  list(): Promise<Rom[]>
  remove(id: string): Promise<void>
  import(): Promise<RomImportResult>
}
