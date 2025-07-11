import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@main': path.resolve(new URL('./src/main', import.meta.url).pathname)
    }
  }
});
