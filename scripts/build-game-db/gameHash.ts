import { type GameList } from "@retroachievements/api";
import { type GamesHashMap } from "../../src/types/games";

// Takes a list of games and groups them by system, building hash → index lookups.
export function createGamesHashMap(games: GameList): GamesHashMap {
  const hashMap: Record<string, number> = {};

  games.forEach((game, gameIndex) => {
    game?.hashes?.forEach((hash) => {
      hashMap[hash] = gameIndex;
    });
  });

  return {
    games,
    hashMap,
  };
}
