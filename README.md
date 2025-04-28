## 总体目标

- [] 使用 Electron-forge 创建一个 Electron.js 项目，并负责软件打包（packaging）。
- [] 使用 vite 负责对代码的打包（Bundling）
- [] 引入类型检测，辅助 IDE 判断，提升编程效率，减少错误。
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

打包后文件的后缀名需要注意一下，一般情况下如果 `package.json` 中已经设置了 `type: module` 其实只需要将后缀名设为 `.js` 即可（`.mjs` 也行）。

~~但是 `preload` 会自动忽略 `package.json` 中的设置，所以必须将后缀名明确写为 `.mjs` 。~~

由于部分依赖需要，暂时保持 `preload` 为 `CommonJS`。

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

### 主进程代码相关 jsconfig.json 的配置

- `checkJs` 是否对 js 文件开启类型检查。
- `module` 控制 **输出的模块系统类型**。设为 `NodeNext`，Node.js 16+ 的模块系统，支持 ESM 和 CommonJS 并结合 package.json 中的 type 字段解析。
- `moduleResolution` 控制 **模块解析行为**。 设为 `Node16`，严格遵循 ESM 和 CommonJS 的新解析规范（需要明确路径和扩展名）。
- `module` 和 `moduleResolution` 两个字段的设置会影响诸如：
  - 引入某些第三方库时能否正常进行类型推导 例如 `electron-store`。
  - 引入本地模块，例如 `import foo from './foo'` 时是否能自动解析到 `'./foo/index.js'`。
  - 引入 json 文件是否需要明确标注 `import someJson from './someJson.json' assert { type: "json" };`。


### 关于类型定义的技巧

#### 定义函数的属性 call-signature

javascript 中的函数是可以有能调用的属性，函数类型表达式语法不允许声明属性。如果我们想用属性来描述可调用的东西，我们可以在对象类型中编写调用签名（call signature）：

```ts
type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};
```

这个写法在使用 jsDoc 的时候也很有用

```js
/**
 * @typedef {{
 *   description: string,
 *   (someArg: number): boolean
 * }} DescribableFunction
 */
```

### 尝试手动触发 OOM 并观测内存使用情况

触发内存溢出

preload 中
```js
import { generateString } from "@/common/utils.js";

let oomTimer;
let memoryHog = [];

function triggerOOM() {
  if (oomTimer) return; // 避免重复启动

  oomTimer = setInterval(async () => {
  // 这里生成的数据类型使用的时字符串，而不是 ArrayBuffer，
  // 因为 preolaod 里面的 ArrayBuffer 很可能是由 Node 在管理，而不是 V8
  // 而我们的目标是触发 V8 的 OOM
  // 期望是每次循环涨 10M 内存，按 UTF16 计算，一个字符占用 2 字节
  // 10M 内存 = (10 * 1024 * 1024 / 2) 个字符
  memoryHog.push(generateString(10 * 1024 * 1024 / 2));
  }, 1000); // 每秒执行一次
}
```

观察内存变化：

```js
function kb2mb(kb) {
  return (kb / 1024).toFixed(2);
}

async function momoryUsage() {
  const memInfo = await process.getProcessMemoryInfo();
  // V8 堆内存信息
  const heapStats = process.getHeapStatistics();

  const memUsed = memInfo.private;
  const memTotal = heapStats.heapSizeLimit;
  const memUsedPercent = (memUsed / memTotal * 100).toFixed(2);

  const heapUsed = heapStats.usedHeapSize;
  const heapTotal = heapStats.totalHeapSize;
  const heapUsedPercent = (heapUsed / heapTotal * 100).toFixed(2);

  console.log(`Memory Usage: ${kb2mb(memUsed)}MB / ${kb2mb(memTotal)}MB, ${memUsedPercent}%\nHeap   Usage: ${kb2mb(heapUsed)}MB / ${kb2mb(heapTotal)}MB, ${heapUsedPercent}%`);
}
```

触发 OOM 之后可能在 shell 中看到下面类似的日志：

```shell
<--- Last few GCs --->

[65115:0x11000c50000]    27901 ms: Scavenge (reduce) (interleaved) 199.2 (199.8) -> 199.0 (200.3) MB, pooled: 4 MB, 1.58 / 0.00 ms  (average mu = 0.936, current mu = 0.922) allocation failure;
[65115:0x11000c50000]    27974 ms: Mark-Compact (reduce) 199.5 (200.3) -> 199.3 (201.0) MB, pooled: 0 MB, 72.42 / 0.00 ms  (+ 2.0 ms in 0 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 100 ms) (average mu = 0.932, curre

<--- JS stacktrace --->

[65115:0110/182055.917640:ERROR:v8_initializer.cc(791)] V8 javascript OOM (Reached heap limit).
18:20:55.920 (main)     › Render Process Gone: Error: Reason: crashed, Exit Code: 5, URL: http://localhost:5173/
    at App.<anonymous> (file:///Users/liuqi/Desktop/Laboratory/electron/electron-complex-demo/.vite/build/main.mjs:6593:40)
    at App.emit (node:events:518:28)
    at WebContents.<anonymous> (node:electron/js2c/browser_init:2:87955)
    at WebContents.emit (node:events:518:28)
```

### 引入 Vue3

在 mian 窗口中使用 vue3 作为前端框架，并同时引入 vue-router 作为路由管理，pinia 作为状态管理，vue-devtools 作为开发辅助工具。

基于使用 vite 作为打包工具考虑安装哪些依赖：

```zsh
npm install vue vue-router pinia
npm install -D @vitejs/plugin-vue vite-plugin-vue-devtools
```

更新 main 窗口的 vite.config.js 配置文件：

```js
//...
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig((incomingConfigs) => {
  // ...

  return {
    //...
    plugins: [
      vue(),
      vueDevTools(),
      //...
    ].filter(Boolean),
    //...
  }
});
```

> 现在 vue-devtools 的引入方式和以前很不一样，不需要改 Electron 主进程代码了。
> devtools 相关的代码会直接注入到前端页面。

剩下的步骤就和其他 Vue3 项目一样了，创建 App.vue，创建路由、状态管理等模块，并更新 main.js 文件。

VS Code 扩展使用 Vue - Official 。

### 引入 Tailwind

Tailwind CSS 框架近几年很流行，本质上可以说是个 postcss 插件。之前一直没有实践过，这次试一试。
目前的版本是 Tailwind V4 安装和使用相比以前更加简单，对 Vite 支持也更好。

安装：

```zsh
npm install -D tailwindcss @tailwindcss/vite 
```

然后在 renderer 窗口的 vite.config.js 中添加相关 plugin：

```js
import tailwindcss from '@tailwindcss/vite';

export default defineConfig((incomingConfigs) => {
  // ...

  return {
    //...
    plugins: [
      tailwindcss(),
      //...
    ].filter(Boolean),
    //...
  }
});
```

V4 版本不太依赖于 js 配置文件了，所以一般的配置项都放在 css 文件里，比如放在 `src/renderer/css/tailwind.css`:

```css
@import "tailwindcss";
@source "${root}/src/renderer/**/*.{vue,js,jsx,tsx,html}"
```

剩下的就是在前端入口文件 main.js 中引入相关的 css 了。

### Vite: 504 (Outdated Optimize Dep)

这个问题多半是由于 vite 的依赖与构建和缓存问题导致的，我这边的解决方式是通过修改 `vite.config.js` 配置解决。

```js
export default defineConfig((incomingConfigs) => {
  // ...

  return {
    //...
    // renderer process 的 cache 和 main precess 的 cache 分开，而且各窗口分开
    cacheDir: join(process.cwd(), `node_modules/.vite/renderer-${name}`),
    //...
    // 启动时主动预构建核心依赖
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia'
      ]
    }
  }
});
```

### Node.js 版本锁定

1. 在 `package.json` 中增加 `engines` 字段，设置允许的版本范围。
2. 在 `.nvmrc` 文件中规定一个具体的使用版本，通过 `nvm use` 命令切换。
3. `package.json` 中增加一个 `preinstall script`，在 `npm install` 之前运行，校验版本。
4. `preinstall` 脚本详见 `checkNodeVersion.js`。