# ROMie MVP

## 1. Import
- [x] Drag‑&‑drop + file picker (single & multi‑select)
- [x] Auto‑copy to `<appdir>/roms/` with unique filenames
- [x] Parse & clean filenames (remove brackets, tags)
- [x] Duplicate detection (MD5): prompt “Keep both / skip / replace”
- [x] Error messaging for unsupported formats, corrupt files, low disk space

## 2. Manage
- [x] List view: clean display name + region badge
- [x] Search/filter bar: name search + platform dropdown
- [x] Library summary view: total count, total size, count by system
- [x] Rom collections (tags)
- [x] Rom favorites
- [x] Roms by system
- [x] Delete ROM (with “Are you sure?”)
- [x] Persistent JSON store (lowdb or election‑store)
- [x] Bulk operations (mass delete, retag)

## 3. Sync
- [ ] Onion OS SD‑card copy (core “sync” MVP)
- [ ] Device profile system (map consoles → target folders)

# Polish & Launch Essentials
- [x] Light/Dark mode
- [ ] Discord server
- [ ] Basic app icon + splash (macOS / Windows)
- [ ] Sentry integration (error + performance breadcrumbs)
- [ ] Simple landing page (GitHub repo link + “Download v1.0”)
- [ ] README & “Getting Started” (screenshots, install steps)

---

## 💭 Future Ideas
- [ ] Add grid list view
- [ ] A minimalistic, neobrutalism theme
- [ ] Automatic updates
- [ ] Create system icons
- [ ] Implement VirtualScroller for improved performance
- [ ] AI boxart remixer
- [ ] Use libretro/libretro-database for game name normalization
- [ ] Retroacheivements
- [ ] Add setting to set the rom storage directory
- [ ] Add Pico8 suport
- [ ] Import `.zip` files (extract and scan contents)
- [ ] Multi-disc PS1 game support (`.bin`/`.cue` grouping)
- [ ] Box art scraping and caching
- [ ] Auto-detect connected devices (e.g. Miyoo Mini+)
- [ ] Process dump info tags ([!], [h], etc)
- [ ] Settings panel (theme, sync preferences, storage path override)
- [ ] Backup and restore your library

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
