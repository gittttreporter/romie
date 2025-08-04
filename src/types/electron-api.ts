import type { Rom, RomDatabaseStats } from "./rom";

export type RomImportResult = {
  canceled: boolean;
  imported: Rom[];
  failed: {
    file: string;
    reason: string;
  }[];
};

export interface RomApi {
  list(): Promise<Rom[]>;
  remove(id: string): Promise<void>;
  update(id: string, romUpdate: Partial<Rom>): Promise<void>;
  import(): Promise<RomImportResult>;
  stats(): Promise<RomDatabaseStats>;
}
