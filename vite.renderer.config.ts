import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: '../../postcss.config.js',
  },
  root: 'src/renderer',
  build: {
    outDir: '../../.vite/renderer/main_window',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
