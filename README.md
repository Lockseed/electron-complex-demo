## 总体目标

- [] 使用 Electron-forge 创建一个 Electron.js 项目，并负责软件打包（packaging）。
- [] 使用 vite 负责对代码的打包（Bundling）
- [] 根据 Electron 官方建议，构建一个沙盒化的应用。
- [] 实现 Electron 所有进程的代码均可调试（Debug）。
- [] 构建一套跨进程调用方法、监听事件的能力。
- [] 构建一套跨进程实时同步数据的能力。
- [] 在项目中引入网络请求，磁盘读写，数据库操作的能力。

## 记录

### 使用 ESModule(ESM)

默认情况下 `vite` 打包出来的文件是 `commonjs` 模块的形式，这种形式 `electron` 直接运行肯定没问题。
但既然是做测试那么 `ESModule` 文件如何和 electron 结合运用也需要尝试一下，所以有几个地方需要修改。

`package.json` 中需要增加 `"type": "module"`。
`forge.config.js` 更改后缀为 `forge.config.cjs` 因为 `electron-forge` 无法动态加载 `ESM` 模块的问件。

关于 `vite` 配置文件:

所有配置文件的 `target` 都设置为 `'esnext'` 毕竟打包出来的 `js` 文件只在 `electron` 内部运行，无需考虑浏览器兼容问题，所以只要做最小化的兼容就行。 

同理 `format` 设置为 `['es']` 就好，无需考虑 `commonjs` 和 `umd` 的问题。

打包后文件的后缀名需要注意一下，一般情况下如果 `package.json` 中已经设置了 `type: module` 其实只需要将后缀名设为 `.js` 即可（`.mjs` 也行），但是 `preload` 会自动忽略 `package.json` 中的设置，所以必须将后缀名明确写为 `.mjs` 。

关于代码中的修改：

`ESModule` 中是没有 `__dirname` 这些默认变量的，需要换成对应的 `import.meta.dirname` 或者其他变量。

