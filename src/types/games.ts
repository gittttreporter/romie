import { type GameList } from "@retroachievements/api";

export interface GamesHashMap {
  games: GameList;
  hashMap: Record<string, number>;
}
