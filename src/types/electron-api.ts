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
  import(): Promise<RomImportResult>
}
