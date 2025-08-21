import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
      "@main": fileURLToPath(new URL('./src/main', import.meta.url)),
    },
  },
});