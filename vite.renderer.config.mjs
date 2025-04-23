// 此文件暂时无用，实际使用的 renderer 配置文件在各个前端页面文件夹下
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
    const name = forgeConfigSelf.name ?? "";

    const outDir = join(process.cwd(), `.vite/renderer/${name}`);

    return {
      mode,
      build: {
        target: 'esnext',
        outDir
      }
    }
  }
);
