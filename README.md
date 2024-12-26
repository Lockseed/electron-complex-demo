## 总体目标

- [] 使用 Electron-forge 创建一个 Electron.js 项目，并负责软件打包（packaging）。
- [] 使用 vite 负责对代码的打包（Bundling）
- [] 根据 Electron 官方建议，构建一个沙盒化的应用。
- [] 实现 Electron 所有进程的代码均可调试（Debug）。
- [] 构建一套跨进程调用方法、监听事件的能力。
- [] 构建一套跨进程实时同步数据的能力。
- [] 在项目中引入网络请求，磁盘读写，数据库操作的能力。
- [] 创建并引入原生依赖（addOn）。

## 记录

### 使用 ESModule(ESM)

默认情况下 `vite` 打包出来的文件是 `commonjs` 模块的形式，这种形式 `electron` 直接运行肯定没问题。
但既然是做测试那么 `ESModule` 文件如何和 electron 结合运用也需要尝试一下，所以有几个地方需要修改。

`package.json` 中需要增加 `"type": "module"`。
`forge.config.js` 更改后缀为 `forge.config.mjs`，内部的模块引用、导出也好相应更改。
`vite.xxx.config.js` 模块暴露方式改为 `export default` , 后缀名可以改成 `mjs` 。

关于 `vite` 配置文件:

所有配置文件的 `target` 都设置为 `'esnext'` 毕竟打包出来的 `js` 文件只在 `electron` 内部运行，无需考虑浏览器兼容问题，所以只要做最小化的兼容就行。 

同理 `format` 设置为 `['es']` 就好，无需考虑 `commonjs` 和 `umd` 的问题。

打包后文件的后缀名需要注意一下，一般情况下如果 `package.json` 中已经设置了 `type: module` 其实只需要将后缀名设为 `.js` 即可（`.mjs` 也行），但是 `preload` 会自动忽略 `package.json` 中的设置，所以必须将后缀名明确写为 `.mjs` 。

关于代码中的修改：

`ESModule` 中是没有 `__dirname` 这些默认变量的，需要换成对应的 `import.meta.dirname` 或者其他变量。

### 多窗口

通常稍大一些的桌面应用都有多个窗口组成，假设所有的窗口前端文件都在 `/src/renderer/` 下分文件夹放置：

```shell
├── node_modules
├── src
│    ├── main
│    ├── preload
│    └── renderer
│            ├── main
│            │     ├── vite.config.js
│            │     └── index.html
│            └── secondary
│                  ├── vite.config.js
│                  └── index.html
├── package.json
├── forge.config.js
├── vite.main.confg.js
└── vite.preload.config.js
```

如上图，可以在每个窗口前端文件夹中放置对应的 vite.config.js 配置文件和 index.html 入口文件。
vite 配置文件中需要重新设置 root 属性和相关的 build 配置。

```js
import { join } from "node:path"
import { defineConfig } from "vite";

export default defineConfig((incomingConfigs) => {
  const { mode, forgeConfigSelf } = incomingConfigs;
  const name = forgeConfigSelf.name ?? "";

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
```

最后在根目录的 forge.config.js 配置文件中配置多窗口。

```js
modules.exports = {
  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        build: [
          // main process 
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'src/renderer/main/vite.config.js',
          },
          {
            name: 'secondary_window',
            config: 'src/renderer/secondary/vite.config.js',
          }
        ],
      }
    }
  ]
}
```

### 分析打包后的文件

分析打包后文件的组成有助于优化包体大小，有时候还能用于 `Debug` 一些问题。
`Vite` 打包主要依赖 `rollup` ，所以这里使用 `rollup-plugin-visualizer` 来分析依赖占据的大小并提供可细化报告。


```js
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

const NPM_COMMAND = process.env.npm_lifecycle_event;

// https://vitejs.dev/config
export default defineConfig({
  build: {
    // ...other options
    rollupOptions: {
      plugins: [
        NPM_COMMAND === 'report' ? visualizer({ filename: 'states-xxx.html' }) : null,
      ].filter(Boolean),
    },
  }
});
```

设置后，使用 `npm run report` 执行可以执行 `electron-forge package` 并生成 `states-xxx.html` 报告。