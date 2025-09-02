/**
 * RetroAchievements API Wrapper
 *
 * These functions wrap functions from the `@retroachievements/api` package to automatically
 * include the stored user credentials from the app settings.
 */
import {
  buildAuthorization,
  getUserProfile as raGetUserProfile,
} from "@retroachievements/api";
import { getRetoroAchievementsConfig } from "@main/roms/romDatabase";

async function getAuth() {
  const config = await getRetoroAchievementsConfig();
  if (!config) {
    throw new Error("RetroAchievements config not set");
  }
  const { username, apiKey: webApiKey } = config;

  return buildAuthorization({ username, webApiKey });
}

export async function getUserProfile() {
  const authorization = await getAuth();

  return raGetUserProfile(authorization, { username: authorization.username });
}
