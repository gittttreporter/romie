import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    vue(),
    sentryVitePlugin({
      org: "jzimz-labs",
      project: "romie",
      release: {
        name: `romie@${process.env.npm_package_version}`,
      },
    }),
  ],
});
