import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/collab-sketches/',
  appType: 'mpa',
  server: {
    open: '/',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sketch01: resolve(__dirname, '01/index.html'),
        template: resolve(__dirname, 'template/index.html'),
      },
    },
  },
});
