import fs from "fs";
import path from "path";
import "dotenv/config";
import {
  buildAuthorization,
  getConsoleIds,
  getGameList,
  type AuthObject,
  type FetchedSystem,
  type GameList,
} from "@retroachievements/api";

const { log } = console;
const DATA_DIR = "src/data/games";
const SYSTEMS_FILE = path.join(DATA_DIR, "systems.json");
const { RA_USERNAME, RA_API_KEY } = process.env;

// Rate limiting: RA doesn't publish exact limits, but we've hit 429 after ~30 systems.
// Being respectful with some gaps between API calls to avoid getting blocked.
const MIN_DELAY = 3000; // 3 seconds between API calls
let lastApiCall = 0; // Timestamp of the last API call

// Crash early if env vars missing - better than mysterious auth errors later
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!RA_USERNAME || !RA_API_KEY) {
  throw new Error(
    "RA_USERNAME and RA_API_KEY must be set in environment variables",
  );
}

// Set up RA auth once, reuse for all API calls
const authorization: AuthObject = buildAuthorization({
  username: RA_USERNAME,
  webApiKey: RA_API_KEY,
});

// Fetch systems list with aggressive caching - this rarely changes
export async function fetchSystems(): Promise<FetchedSystem[]> {
  if (fs.existsSync(SYSTEMS_FILE)) {
    log("[CACHE] Loading systems from cached data");
    const data = fs.readFileSync(SYSTEMS_FILE, "utf8");
    return JSON.parse(data);
  }

  log("[API] Fetching systems from RetroAchievements...");
  const systems = await getConsoleIds(authorization, {
    shouldOnlyRetrieveActiveSystems: false,
    shouldOnlyRetrieveGameSystems: true,
  });

  log(`[CACHE] Saving ${systems.length} systems for future runs`);
  fs.writeFileSync(SYSTEMS_FILE, JSON.stringify(systems, null, 2));

  return systems;
}

// Fetch games per system - includes hashes which is what we actually want
export async function fetchGamesForSystem(systemId: number): Promise<GameList> {
  const gameFile = path.join(DATA_DIR, `games-${systemId}.json`);

  if (fs.existsSync(gameFile)) {
    log(`  [CACHE] Loading games from cached data`);
    const data = fs.readFileSync(gameFile, "utf8");
    return JSON.parse(data); // No delay for cached data
  }
  // Enforce minimum delay between API calls to avoid rate limiting
  const timeSinceLastCall = Date.now() - lastApiCall;

  if (timeSinceLastCall < MIN_DELAY) {
    const waitTime = MIN_DELAY - timeSinceLastCall;
    log(`  [WAIT] Cooling down for ${(waitTime / 1000).toFixed(1)}s...`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  log(`  [API] Fetching game data from RetroAchievements...`);
  lastApiCall = Date.now();

  try {
    const gameList = await getGameList(authorization, {
      consoleId: systemId,
      shouldOnlyRetrieveGamesWithAchievements: false,
      shouldRetrieveGameHashes: true,
    });
    log(`  [DATA] Retrieved ${gameList.length} games with ROM hashes`);
    log(`  [CACHE] Saving games for future runs`);
    fs.writeFileSync(gameFile, JSON.stringify(gameList, null, 2));

    return gameList;
  } catch (error) {
    log(
      `  [ERROR] Failed to fetch games for system ${systemId}: ${(error as Error).message}`,
    );
    throw error;
  }
}
