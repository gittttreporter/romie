## ✅ V1 MVP (Must Have to Launch)

- [ ] Simple search box (filter by name)
- [ ] Detect duplicate ROMs (MD5 hash comparison with user confirmation)
- [ ] Basic error handling (corrupted files, unsupported formats, disk space)
- [ ] Basic app icon
- [x] Automatically save ROM files into `<appdir>/roms/`
- [x] Import single ROM files (e.g. `.gba`, `.sfc`, `.nes`)
- [x] Parse basic filename info (game name, region, version tags)
- [x] Generate clean display names for UI (remove brackets and region tags)
- [x] Store metadata to `roms.json`
- [x] ROM list view in the UI with region tag
- [x] Delete ROMs from the library

---

## 💭 Future Ideas

- [ ] Use libretro/libretro-database for game name normalization
- [ ] Import `.zip` files (extract and scan contents)
- [ ] Multi-disc PS1 game support (`.bin`/`.cue` grouping)
- [ ] Box art scraping and caching
- [ ] Favorite/star ROMs
- [ ] Tag ROMs (e.g. "Fan Translation", "Repro", etc.)
- [ ] Auto-detect connected devices (e.g. Miyoo Mini+)
- [ ] One-click sync to SD card / device folder
- [ ] Process dump info tags ([!], [h], etc)
- [ ] Settings panel (theme, sync preferences, storage path override)
- [ ] Backup and restore your library
- [ ] Advanced filtering (by system, region, tags)
- [ ] Bulk operations (mass delete, retag)

---

## ✏️ Scratchpad

Device profiles will help with file copy:
```javascript
interface DeviceProfile {
  name: string;
  folderStructure: Record<ConsoleCode, string>;
}

const ONION_OS_PROFILE: DeviceProfile = {
  name: 'Onion OS (Miyoo Mini Plus)',
  folderStructure: {
    gba: 'Roms/GBA',
    snes: 'Roms/SFC', // Note: Uses SFC not SNES
    // etc...
  }
}
```
