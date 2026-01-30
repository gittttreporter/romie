/**
 * Builds ROM hash lookup tables from RetroAchievements API data.
 *
 * Why not DAT files? They're huge and we'd need to ship them with the app.
 * This approach fetches only the games RA knows about (which covers most popular ROMs)
 * and creates fast hash→game lookups sharded by system.
 *
 * Memory optimization: Only load the systems you're actually scanning.
 * Scanning NES ROMs? Only load the NES hash file, not all 50+ systems.
 */
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { type GameList } from '@retroachievements/api';
import { fetchGamesForSystem } from './gameFetch';
import { createGamesHashMap } from './gameHash';
import { RA_SYSTEMS } from '../../src/utils/systems';

const { log } = console;
const DATA_DIR = 'src/data/ra';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function buildGameDatabase() {
  log('[BUILD] Starting game hash database build...');
  const games: GameList = [];
  log(`[BUILD] Processing ${RA_SYSTEMS.length} systems`);

  // Sequentially fetch game data for supported systems. This is intentionally not parallel
  // in order to reduce concurrent load on RA. I'm trying to avoid being blocked.
  for (const [index, system] of RA_SYSTEMS.entries()) {
    log(`[${index + 1}/${RA_SYSTEMS.length}] Processing: ${system.code} (ID: ${system.consoleId})`);
    const gamesForSystem = await fetchGamesForSystem(system.consoleId);
    games.push(...gamesForSystem);
  }

  // Create a single large hash map for all systems. For now, I'm not sharding by system
  // to keep things simple. If memory usage becomes a concern, I'll revisit this.
  log(`[BUILD] Creating hash map for ${games.length} total games...`);
  const hashMap = createGamesHashMap(games);
  const hashFile = path.join(DATA_DIR, `all-games.json`);
  fs.writeFileSync(hashFile, JSON.stringify(hashMap, null, 2));
  log(
    `[WRITE] ${games.length} games, ${Object.values(hashMap.hashMap).length} hashes -> ${path.basename(hashFile)}`
  );
}

// Run the build process
(async function main() {
  const startTime = Date.now();
  try {
    await buildGameDatabase();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('\n[DONE] Hash database build completed successfully');
    log(`[TIMING] Build completed in ${duration}s`);
  } catch (error) {
    console.error('[ERROR] Hash database build failed:', error);
    process.exit(1);
  }
})();
