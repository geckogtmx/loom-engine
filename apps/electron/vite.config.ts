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
              external: ['electron', 'better-sqlite3'],
            },
          },
        },
      },
      {
        entry: 'src/preload.ts',
        onready(options) {
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
});
