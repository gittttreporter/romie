import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@main": fileURLToPath(new URL("./src/main", import.meta.url)),
    },
  },

  build: {
    sourcemap: true,
  },

  plugins: [
    sentryVitePlugin({
      org: "jzimz-labs",
      project: "romie",
      release: {
        name: `romie@${process.env.npm_package_version}`,
      },
    }),
  ],
});
