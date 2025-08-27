/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 */

import { init, browserTracingIntegration } from "@sentry/electron/renderer";
import { init as vueInit } from "@sentry/vue";
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import Aura from "@primeuix/themes/aura";
import App from "./App.vue";
import router from "./router";
import pinia from "./stores";
import { SENTRY_DSN, SENTRY_SAMPLE_RATE } from "./sentry.config";

import "./styles/main.css";
import "primeicons/primeicons.css";

init(
  {
    dsn: SENTRY_DSN,
    sendDefaultPii: true,
    integrations: [browserTracingIntegration()],
    tracesSampleRate: SENTRY_SAMPLE_RATE,
  },
  vueInit,
);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.use(ConfirmationService);
app.use(ToastService);
app.mount("#app");
