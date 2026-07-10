import { configDefaults, defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

const srcDir = resolve(import.meta.dirname, './src');

export default defineConfig({
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  test: {
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
});
