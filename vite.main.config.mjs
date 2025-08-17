import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(new URL("./src", import.meta.url).pathname),
      "@main": path.resolve(new URL("./src/main", import.meta.url).pathname),
    },
  },
});
