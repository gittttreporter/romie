import { defineStore } from 'pinia'
import log from 'electron-log/renderer';
import type { Rom } from '@/types/rom'
import type { RomImportResult } from '@/types/electron-api'

interface RomState {
  roms: Rom[]
  loading: boolean
  error: string | null
  selectedRom: Rom | null
}

export const useRomStore = defineStore('roms', {
  state: (): RomState => ({
    roms: [],
    loading: false,
    error: null,
    selectedRom: null
  }),

  getters: {
    romCount(): number {
      return this.roms.length
    }
  },

  actions: {
    async loadRoms() {
      log.info('Loading rom data..')
      this.loading = true;

      try {
        this.roms = await window.rom.list()
      } catch (error) {
        log.error(error)
      } finally {
        this.loading = false;
      }
    },
    async removeRom(id: string) {
      log.info(`Removing ${id}`)
      this.loading = true;

      try {
        await window.rom.remove(id)
        this.loadRoms()
      } catch (error) {
        log.error(error)
      } finally {
        this.loading = false;
      }
    },
    async importRom(): Promise<RomImportResult> {
      log.info('Initiating rom import..')
      const importResults = await window.rom.import();
      await this.loadRoms()

      return importResults;
    }
  }
})
