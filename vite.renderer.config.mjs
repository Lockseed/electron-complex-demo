// Historical example only. Electron Forge does not read this file.
// Actual renderer configs live in:
// - src/renderer/main/vite.config.js
// - src/renderer/secondary/vite.config.js
import { join } from 'node:path';
import { defineConfig } from 'vite';

/**
 * @typedef {import('vite').ConfigEnv & { forgeConfigSelf: { name?: string } }} ForgeConfigEnv
 */

// https://vitejs.dev/config
export default defineConfig(
  /**
   * @param {ForgeConfigEnv} incomingConfigs
   */
  (incomingConfigs) => {
    const { mode, forgeConfigSelf } = incomingConfigs;
    const name = forgeConfigSelf.name ?? '';

    const outDir = join(process.cwd(), `.vite/renderer/${name}`);

    return {
      mode,
      build: {
        target: 'esnext',
        outDir,
      },
    };
  }
);
