import { resolve } from "node:path";
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

const NPM_COMMAND = process.env.npm_lifecycle_event;
const dirname = import.meta.dirname;
const srcDir = resolve(dirname, './src');

// https://vitejs.dev/config
export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/main/main.js',
      fileName: () => '[name].mjs',
      formats: ['es']
    },
    rollupOptions: {
      external: ['electron-squirrel-startup'],
      plugins: [
        NPM_COMMAND === 'report' ? visualizer({ filename: 'states-main.html' }) : null,
      ].filter(Boolean),
    },
  },
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
});
