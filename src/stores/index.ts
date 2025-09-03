import { createPinia } from "pinia";
// import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia();
// TODO: Consider using persisted state
// pinia.use(createPersistedState())

export default pinia;

// Re-export stores
export { useRomStore } from "./roms";
export { useDeviceStore } from "./devices";
export { useUIStore } from "./ui";
export { useFeatureFlagStore } from "./featureFlags";
