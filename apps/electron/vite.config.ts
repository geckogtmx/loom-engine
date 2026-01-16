import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import path from 'path';

export default defineConfig({
  plugins: [
    electron([
      {
        entry: 'src/main.ts',
        vite: {
          build: {
            outDir: 'dist',
            rollupOptions: {
              external: ['electron', 'better-sqlite3', 'ws', 'bufferutil', 'utf-8-validate'],
            },
          },
        },
      },
      {
        entry: 'src/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist',
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
  },
});
