import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/main/main.js',
      fileName: () => '[name].mjs',
      formats: ['es']
    }
  }
});
