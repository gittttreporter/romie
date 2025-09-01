import { type GameList } from "@retroachievements/api";

export interface GamesHashMap {
  games: GameList;
  hashMap: Record<string, number>;
}

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
