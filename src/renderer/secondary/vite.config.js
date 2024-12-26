import { join } from "node:path"
import { defineConfig } from "vite";

export default defineConfig((incomingConfigs) => {
  const { mode, forgeConfigSelf } = incomingConfigs;
  const name = forgeConfigSelf.name ?? "secondary_window";

  // import.meta.dirname 指向当前配置文件所在的目录(无 file:// 前缀)
  // process.cwd() 指向当前工作目录(无 file:// 前缀)

  const dirname = import.meta.dirname;
  const outDir = join(process.cwd(), `.vite/renderer/${name}`);

  return {
    root: dirname,
    mode,
    build: {
      target: "esnext",
      outDir,
    }
  }
});
