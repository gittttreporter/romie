export type AppTheme = "light" | "dark" | "system";

export interface AppSettings {
  theme: AppTheme;
}

export interface RetroAchievementsConfig {
  username: string;
  apiKey: string;
}

export interface AppIntegrations {
  retroachievements: RetroAchievementsConfig;
}
