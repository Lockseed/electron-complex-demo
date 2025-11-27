import { join } from 'node:path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig((incomingConfigs) => {
  const { mode, forgeConfigSelf } = incomingConfigs;
  const name = forgeConfigSelf.name ?? 'main_window';

  // import.meta.dirname 指向当前配置文件所在的目录(无 file:// 前缀)
  // process.cwd() 指向当前工作目录(无 file:// 前缀)

  const dirname = import.meta.dirname;
  const outDir = join(process.cwd(), `.vite/renderer/${name}`);
  const srcDir = join(process.cwd(), 'src');

  const NPM_COMMAND = process.env.npm_lifecycle_event;

  return {
    root: dirname,
    mode,
    build: {
      target: 'esnext',
      outDir,
    },
    // 尝试解决 Outdated Optimize Dep 问题
    cacheDir: join(process.cwd(), `node_modules/.vite/renderer-${name}`),
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
      NPM_COMMAND === 'report' ? visualizer({ filename: `states-renderer-${name}.html` }) : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia'],
    },
  };
});
