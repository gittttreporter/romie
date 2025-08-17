# ROMie MVP

## v0.1 - Alpha (Target: [2025-08-21])
**Goal:** Core workflow works end-to-end for early testers

### Import
- [x] Drag‑&‑drop + file picker (single & multi‑select)
- [x] Auto‑copy to `<appdir>/roms/` with unique filenames
- [x] Parse & clean filenames (remove brackets, tags)
- [x] Duplicate detection (MD5): prompt “Keep both / skip / replace”
- [x] Error messaging for unsupported formats, corrupt files, low disk space

### Manage
- [x] List view: clean display name + region badge
- [x] Search/filter bar: name search + platform dropdown
- [x] Library summary view: total count, total size, count by system
- [x] Rom collections (tags)
- [x] Rom favorites
- [x] Roms by system
- [x] Delete ROM (with “Are you sure?”)
- [x] Persistent JSON store (lowdb or election‑store)
- [x] Bulk operations (mass delete, retag)

### Sync
- [ ] Onion OS SD‑card copy (core “sync” MVP)
- [ ] Device profile system (map consoles → target folders)

### Polish & Launch Essentials
- [x] Light/Dark mode
- [x] Discord server
- [ ] Basic app icon + splash (macOS / Windows)

## v0.2 - Beta (Target: 4-6 weeks post-alpha)
**Goal:** Ready for wider testing, remove major friction

- [ ] Add ability to scan existing ROM libraries
- [ ] Add sentry integration
- [ ] Add issue tracker
- [ ] Box art scraping (see https://www.screenscraper.fr/)
- [ ] Multi-disc game support (`.bin`/`.cue` grouping)
- [ ] Add ko-fi button in sidebar footer

## v1.0 - Public Launch (Target: TBD after beta feedback)
**Goal:** Polished product ready for general users

- [ ] Landing page, documentation, remaining polish
- [ ] Any critical fixes from beta testing
- [ ] Settings panel (basic preferences)
- [ ] Automatic updates
- [ ] Monetization strategy implementation (freemium/purchase/ads)

## 💭 Future Ideas
- [ ] Manage game saves across multiple devices
- [ ] Add Pico8 support
- [ ] Use libretro/libretro-database for game name normalization
- [ ] Add Retroacheivements into ROM details vue
- [ ] Add icons for system list
- [ ] Add grid list view
- [ ] Import `.zip` files (extract and scan contents)
- [ ] Auto-detect connected devices (e.g. Miyoo Mini+)
- [ ] Process dump info tags ([!], [h], etc)
- [ ] Settings panel (theme, sync preferences, storage path override)
- [ ] Backup and restore your library
- [ ] Implement VirtualScroller for improved performance
- [ ] A minimalistic, neobrutalism theme
- [ ] Use AI to remix boxart into a custom style
- [ ] Use AI to allow chatting about a game
- [ ] Use AI to reccomend games you might like to add

---

## ✏️ Scratchpad
* Take a look at how https://muos.dev/web/syncthing does syncing for inspiration
* Profile backlog
//   { value: "generic", name: "Generic Profile (Most Devices)" },
//   { value: "onion-mm+", name: "OnionOS (Miyoo Mini+)" },
//   { value: "allium-mm+", name: "Allium (Miyoo Mini+)" },
//   { value: "dotui-mm+", name: "DotUI (Miyoo Mini+)" },
//   { value: "stock-mm+", name: "Stock OS (Miyoo Mini+)" },
