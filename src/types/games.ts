import { type GameList } from '@retroachievements/api';

// TODO: Remove duplicate export in roms.ts
export type GameEntity = GameList[number];

export interface GamesHashMap {
  games: GameList;
  hashMap: Record<string, number>;
}
