import { defineStore } from "pinia";
import log from "electron-log/renderer";
import type { Rom, RomDatabaseStats } from "@/types/rom";
import type { RomImportResult } from "@/types/electron-api";

interface RomState {
  roms: Rom[];
  stats: RomDatabaseStats;
  loading: boolean;
  error: string | null;
  selectedRom: Rom | null;
}

export const useRomStore = defineStore("roms", {
  state: (): RomState => ({
    roms: [],
    stats: {
      totalRoms: 0,
      totalSizeBytes: 0,
      systemCounts: {},
    },
    loading: false,
    error: null,
    selectedRom: null,
  }),

  getters: {
    getRomById: (state) => (id: string) =>
      state.roms.find((rom) => rom.id === id),
    romsByTag(state): Record<string, Rom[]> {
      const result: Record<string, Rom[]> = {};

      state.roms.forEach((rom) => {
        (rom.tags || []).forEach((tag) => {
          result[tag] ??= [];
          result[tag].push(rom);
        });
      });

      return result;
    },
  },

  actions: {
    async loadStats() {
      log.info("Loading rom stats..");

      try {
        this.stats = await window.rom.stats();
        log.info("Loaded rom stats");
      } catch (error) {
        log.error(error);
      }
    },
    async loadRoms() {
      log.info("Loading rom data..");
      this.loading = true;

      try {
        this.roms = await window.rom.list();
      } catch (error) {
        log.error(error);
      } finally {
        this.loading = false;
      }
    },
    async removeRom(id: string) {
      log.info(`Removing ${id}`);
      this.loading = true;

      try {
        await window.rom.remove(id);
        await this.loadRoms();
        await this.loadStats();
      } catch (error) {
        log.error(error);
      } finally {
        this.loading = false;
      }
    },
    async updateRom(id: string, romUpdate: Partial<Rom>) {
      log.info(`Updating ${id}`, romUpdate);
      this.loading = true;

      try {
        await window.rom.update(id, romUpdate);
        await this.loadRoms();
        await this.loadStats();
      } catch (error) {
        log.error(error);
      } finally {
        this.loading = false;
      }
    },
    async importRom(): Promise<RomImportResult> {
      log.info("Initiating rom import..");
      const importResults = await window.rom.import();
      await this.loadRoms();
      await this.loadStats();

      return importResults;
    },
  },
});
