import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

const NPM_COMMAND = process.env.npm_lifecycle_event;

// https://vitejs.dev/config
export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name].mjs',
      },
      plugins: [
        NPM_COMMAND === 'report' ? visualizer({ filename: 'states-preload.html' }) : null,
      ].filter(Boolean),
    }
  }
});
