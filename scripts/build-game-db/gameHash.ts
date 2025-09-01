import { type GameList } from "@retroachievements/api";
import { type GamesHashMap } from "../../src/types/games";

// Takes a list of games and groups them by system, building hash → index lookups.
export function createGamesHashMap(games: GameList): GamesHashMap {
  const hashMap: Record<string, number> = {};

  games.forEach((game, gameIndex) => {
    game?.hashes?.forEach((hash) => {
      // Force to lowercase for consistency since I've seen mixed case hashes in RA data.
      hashMap[hash.toLowerCase()] = gameIndex;
    });
  });

  return {
    games,
    hashMap,
  };
}
