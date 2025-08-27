import { createPinia } from "pinia";
import { createSentryPiniaPlugin } from "@sentry/vue";
// import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia();
// TODO: Consider using persisted state
// pinia.use(createPersistedState())
pinia.use(createSentryPiniaPlugin());

export default pinia;

// Re-export stores
export { useRomStore } from "./roms";
export { useDeviceStore } from "./devices";
export { useUIStore } from "./ui";
