import type { RomApi } from './electron-api'

declare global {
  interface Window {
    rom: RomApi
  }
}
