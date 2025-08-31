import { type GameList } from "@retroachievements/api";

export interface GamesHashMap {
  games: GameList;
  hashMap: Record<string, number>;
  systemId: number;
  systemName: string;
}

// Takes a list of games and groups them by system, building hash→index lookups.
// Handles mixed systems gracefully - if upstream accidentally gives us games from multiple
// systems, we'll detect and separate them correctly instead of crashing.
export function createGamesHashMap(games: GameList): GamesHashMap[] {
  const hashMappings: Record<number, GamesHashMap> = {};

  games.forEach((game) => {
    const { consoleId, consoleName, hashes } = game;

    hashMappings[consoleId] ??= {
      games: [],
      hashMap: {},
      systemId: consoleId,
      systemName: consoleName,
    };

    const gameIndex = hashMappings[consoleId].games.length;
    hashMappings[consoleId].games.push(game);

    // Map each hash to this game's position in the system's array
    hashes?.forEach((hash) => {
      hashMappings[consoleId].hashMap[hash] = gameIndex;
    });
  });

  return Object.values(hashMappings);
}
