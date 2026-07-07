# AI Readiness Report

审计日期：2026-07-07

本报告的目标不是给项目接入 AI 功能，而是评估并改进 Codex/AI coding agent 理解、修改和验证该 Electron demo 项目的能力。

## 1. 当前项目概览

### 技术栈与运行形态

- Electron Forge 负责启动、打包、制作安装产物。
- Vite 负责 main、preload、utility worker、renderer 多入口构建。
- main/worker 以 ESM 输出，preload 以 CJS 输出。
- renderer 主窗口使用 Vue 3、Vue Router、Tailwind CSS 4、daisyUI 5。
- 项目使用 JavaScript + JSDoc + `jsconfig.json`，当前不是 TypeScript 项目。
- Node 版本被锁定为 `>=22.0.0 <23.0.0`，`.nvmrc` 为 `22.15.1`。

### 关键目录

- `src/main/`：Electron 主进程入口、窗口管理、IPC handler/event、store、protocol、deep link、worker 管理。
- `src/preload/`：preload 入口和桥接层，通过 `contextBridge` 暴露 remote APIs/events/stores。
- `src/renderer/main/`：主窗口 Vue 应用。
- `src/renderer/secondary/`：次窗口 renderer，当前是简单示例入口。
- `src/worker/`：Electron `utilityProcess` worker，承载 file service 等较重任务。
- `src/common/`：main/preload/worker/renderer 共用常量、类型、工具和内存 store。
- `scripts/`：目前只有 Node 版本检查脚本。
- `.github/instructions/`：已有 daisyUI 指令文件。

### 当前入口与构建链

- `package.json#main` 指向 `.vite/build/main.mjs`。
- `forge.config.mjs` 通过 `@electron-forge/plugin-vite` 定义：
  - main entry: `src/main/main.js`
  - worker entry: `src/worker/worker.js`
  - preload entry: `src/preload/preload.js`
  - renderer entries: `main_window`、`secondary_window`
- `vite.main.config.mjs`、`vite.preload.config.mjs`、`vite.worker.config.mjs` 是实际构建配置。
- `src/renderer/main/vite.config.js` 与 `src/renderer/secondary/vite.config.js` 是实际 renderer 配置。
- `vite.renderer.config.mjs` 明确写着“暂时无用”，但仍在根目录存在。

## 2. AI Readiness 判断

### 新开发者/AI 能否快速理解项目结构

结论：部分具备。

优点：

- 目录结构基本遵循 Electron 常见分层：`main`、`preload`、`renderer`、`worker`、`common`。
- README 记录了 ESM、Forge、Vite、多窗口、Tailwind、ESLint/Prettier 等大量背景。
- 文件命名大体直观，例如 `windowManager`、`workerManager`、`remoteMain`、`remoteWorker`。

不足：

- README 更像实验笔记，不是“上手手册”。AI 需要从大量历史记录中推断当前事实。
- 没有根级 `AGENTS.md`，也没有目录级 README 来声明每个目录的职责和禁止事项。
- `.github/copilot-instructions.md` 存在但为空，已有 AI 入口没有承载项目约定。
- `vite.renderer.config.mjs` 是无用配置，容易被 AI 当成实际 renderer 配置修改。

### 是否有明确 main / preload / renderer 边界

结论：代码中边界存在，但缺少文档化规则。

当前边界：

- `main` 创建窗口、注册协议、注册 IPC、管理 store、管理 utility worker。
- `preload` 使用 `contextBridge.exposeInMainWorld` 暴露：
  - `window.__remoteAPIs`
  - `window.__remoteEvents`
  - `window.__remoteStores`
- `renderer` 不直接使用 Node/Electron API。
- `worker` 通过 `utilityProcess` 与 main 通信，并通过 `MessageChannelMain` 与 renderer 形成 RPC 通道。

安全配置：

- 主窗口和次窗口都设置了 `sandbox: true`。
- 主窗口和次窗口都设置了 `contextIsolation: true`。
- 主窗口和次窗口都设置了 `nodeIntegration: false`。
- 主窗口和次窗口都设置了 `nodeIntegrationInWorker: false`。

主要缺口：

- 没有文档说明 renderer 只能通过 preload 暴露的接口访问 Electron 能力。
- 没有文档说明新增 IPC handler/event 的注册路径、命名规则、参数校验要求和安全审查要求。
- `__remoteAPIs`、`__remoteEvents`、`__remoteStores` 是全局魔法名，缺少类型声明或说明。
- `src/main/handlers.js` 中的 handler 对 renderer 入参没有统一校验层，AI 后续添加功能时容易直接扩大暴露面。

### 是否有一键安装、启动、构建、测试、lint、打包命令

结论：安装、启动、lint、格式检查、打包基本具备；测试、类型检查、低成本构建命令缺失。

已有命令：

- 安装：可使用标准 `npm ci` / `npm install`，并通过 `preinstall` 检查 Node 版本。
- 启动：`npm run dev`
- 打包应用目录：`npm run package`
- 生成分析报告：`npm run report`
- 制作安装产物：`npm run make`
- 发布：`npm run publish`
- lint：`npm run lint`
- 自动修复 lint：`npm run lint:fix`
- 格式化：`npm run format`
- 格式检查：`npm run format:check`

缺失命令：

- `npm run build`：建议定义为生产构建或 Forge package 的清晰别名。
- `npm test` / `npm run test`：没有测试框架和测试脚本。
- `npm run typecheck`：虽然 `jsconfig.json` 开启了 `checkJs`，但没有可在 CI/AI 中执行的类型检查命令。
- `npm run verify`：没有聚合 lint、format、typecheck、test、package 的统一验证命令。

### 是否有可靠的验证路径

结论：目前只有 lint、format 和 package 构建链，可靠性不足。

已验证命令：

- `node scripts/checkNodeVersion.cjs`：通过，当前 Node 为 `22.15.1`。
- `npm run lint`：通过。
- `npm run format:check`：通过。
- `npm run package`：在受限网络下失败于 `getaddrinfo ENOTFOUND npmmirror.com`；允许网络后通过。

验证缺口：

- 无单元测试。
- 无 Electron main/preload/renderer 集成测试。
- 无 Playwright/Electron 冒烟测试。
- 无类型检查命令。
- 无安全边界验证，例如断言 `nodeIntegration: false`、`contextIsolation: true`、preload 暴露白名单。
- 无 CI 配置。

### 是否存在容易误导 AI 的内容

存在。

- `vite.renderer.config.mjs` 标注为暂时无用，但文件名像根级 renderer 配置。
- README 是历史记录式文档，包含旧尝试、示例代码和当前状态混杂。
- README 中建议“核心依赖升级时删除 `package-lock.json`”容易误导 AI 破坏可复现安装。更安全的表达应是“在明确需要重算依赖树时再重新生成 lockfile，并审查 diff”。
- `.github/copilot-instructions.md` 是空文件，AI 可能误以为没有项目约定。
- `report` 脚本名不够明确，实际执行的是 `electron-forge package`，依赖 `npm_lifecycle_event === 'report'` 触发 visualizer。
- `package-lock.json` 中大量 `resolved` 指向 `registry.npmmirror.com`，在无该镜像 DNS/网络的环境中会造成安装或打包下载失败。
- `src/preload/debug.js` 中包含触发 renderer crash/OOM 的调试能力，虽然通过事件触发，但缺少“仅调试使用”的边界文档。
- `src/renderer/secondary/` 当前非常薄，像占位 demo；AI 可能误判为未完成窗口或误删。
- `src/common/types.js` 有类型别名，但没有生成 `.d.ts` 或全局 window 类型说明，renderer 侧调用全局对象时缺少 IDE/AI 可见契约。

## 3. Electron 安全边界评估

当前项目已经采用较好的基础安全配置：

- `sandbox: true`
- `contextIsolation: true`
- `nodeIntegration: false`
- `nodeIntegrationInWorker: false`
- 使用 `contextBridge`，没有把 `ipcRenderer` 本体直接暴露给 renderer。
- `window.open` 被 `setWindowOpenHandler` 拦截并默认 `deny`。
- `will-navigate` 对非内部 URL 阻止默认导航，并交给 `shell.openExternal`。
- `file://` 协议 handler 对访问路径做了 userData/appPath 白名单判断。
- Forge fuses 禁用了 `RunAsNode`、`NODE_OPTIONS`、CLI inspect 等能力，并启用 asar integrity 相关配置。

建议补充说明或改造：

- 文档化“renderer 禁止直接引入 Electron/Node 模块”。
- 文档化“新增 IPC 必须在 main/worker 注册表中显式登记，参数必须验证，禁止透传任意 channel”。
- 给 `window.__remoteAPIs` 等全局对象增加 `.d.ts` 或 JSDoc 类型说明。
- 给 debug crash/OOM 能力加开发环境约束或明确的安全注释。
- 为 `handleUrl` 增加允许协议说明，避免未来 AI 支持任意外链协议。
- 为 `protocol.handle('file')` 的路径白名单规则增加测试，防止路径绕过。

## 4. 建议新增或修改的文件

优先级 P0：

- `AGENTS.md`
  - 给 Codex/AI coding agent 的根级操作手册。
  - 说明架构、目录职责、常用命令、验证路径、安全边界、禁止事项。

- `docs/architecture/electron-boundaries.md`
  - 固化 main/preload/renderer/worker 的职责。
  - 说明 IPC API/event/store 的新增流程。
  - 说明安全默认值和变更审批点。

- `docs/ai/AI_READINESS_REPORT.md`
  - 本报告，作为后续改造入口。

优先级 P1：

- `src/preload/window-api.d.ts` 或 `src/renderer/global.d.ts`
  - 声明 `window.__remoteAPIs`、`window.__remoteEvents`、`window.__remoteStores`。

- `docs/dev/verification.md`
  - 记录本地验证命令、预期输出、哪些命令需要网络或 GUI。

- `docs/dev/scripts.md`
  - 解释 `dev`、`package`、`report`、`make`、`publish` 的差异。

- `src/main/README.md`
  - 主进程启动顺序、窗口管理、IPC 注册点、禁止 renderer 直接触达 main 实现。

- `src/preload/README.md`
  - preload 暴露规则、全局对象、禁止暴露 `ipcRenderer`。

- `src/renderer/README.md`
  - Vue 主窗口、secondary 窗口、路由、样式系统。

- `src/worker/README.md`
  - utilityProcess 的职责、RPC 方式、适合放入 worker 的任务类型。

优先级 P2：

- `.github/copilot-instructions.md`
  - 不应保持空文件。可以同步 AGENTS.md 的短版规则。

- `docs/tasks/feature-template.md`
  - 新功能任务模板，要求列出触碰进程、IPC 变更、验证命令、安全影响。

- `docs/tasks/bugfix-template.md`
  - Bug 修复模板，要求复现步骤、根因、回归测试和验证命令。

- 删除或迁移 `vite.renderer.config.mjs`
  - 如果确实不用，建议删除。
  - 如果保留，建议改名到 `docs/examples/` 或在文件头写明“示例，不被 Forge 使用”。

## 5. 推荐 npm scripts

建议新增：

```json
{
  "scripts": {
    "build": "electron-forge package",
    "typecheck": "tsc --noEmit -p jsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "verify": "npm run format:check && npm run lint && npm run typecheck && npm test",
    "verify:package": "npm run verify && npm run package",
    "clean": "rimraf .vite out .temp states-*.html"
  }
}
```

说明：

- `build` 应该给 AI 一个熟悉、低歧义的生产构建入口。若项目语义上认为 `package` 就是 build，可让 `build` 作为别名。
- `verify` 应该是默认提交前命令，不建议默认包含重型打包。
- `verify:package` 用于合并前或发布前。
- `typecheck` 如果继续使用 JS 项目，可先用 `tsc --allowJs --checkJs --noEmit` 路线；具体配置需小步验证。
- `clean` 需要新增依赖 `rimraf`，或使用跨平台 Node 脚本实现。

可考虑调整：

- 将 `report` 改名或补充别名为 `package:analyze`。
- 保留 `report` 兼容旧习惯，但在 README/scripts 文档中说明它会执行 Forge package。
- `publish` 建议文档化所需凭据和发布环境，避免 AI 在无上下文时误跑。

## 6. 建议的 AGENTS.md 内容大纲

```md
# AGENTS.md

## Project Shape

- Electron Forge + Vite + Vue 3 application.
- Main process: `src/main`.
- Preload bridge: `src/preload`.
- Renderer windows: `src/renderer/main`, `src/renderer/secondary`.
- Utility worker: `src/worker`.
- Shared code: `src/common`.

## Commands

- Install: `npm ci`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Format check: `npm run format:check`
- Package: `npm run package`
- Full local verification: `npm run verify` once added

## Architecture Rules

- Renderer must not import Electron or Node built-ins.
- Renderer talks to native capabilities only through preload-exposed interfaces.
- Preload must not expose `ipcRenderer` directly.
- Add main IPC handlers in `src/main/handlers.js` or a module exported from it.
- Add main events in `src/main/events.js` or a module exported from it.
- Add worker APIs in `src/worker/handlers.js`.
- Keep channel names namespaced as `namespace::methodName`.
- Validate renderer-provided input before filesystem, shell, network, or OS access.

## Electron Security Rules

- Keep `contextIsolation: true`.
- Keep `nodeIntegration: false`.
- Keep `sandbox: true`.
- Do not weaken Forge fuses without documenting why.
- Do not allow arbitrary external protocols or arbitrary `file://` paths.

## Documentation Rules

- Update the relevant directory README when changing main/preload/renderer/worker responsibilities.
- Update window global type declarations when changing preload exposure.
- Update verification docs when adding or changing scripts.

## Verification Before Final Response

- Run `npm run lint`.
- Run `npm run format:check`.
- Run focused tests if present.
- For Electron boundary changes, run `npm run package` or the documented Electron smoke test.

## Generated Files

- Do not edit `.vite/`, `out/`, `.temp/`, `states-*.html`, or `node_modules/`.
- Treat `package-lock.json` as source of truth unless explicitly changing dependencies.
```

## 7. 分阶段改造计划

### Phase 0：建立 AI 导航基线

目标：让 AI 一眼知道项目怎么走、哪些地方不能碰。

建议改动：

- 新增根级 `AGENTS.md`。
- 将 `.github/copilot-instructions.md` 从空文件改为 AGENTS 短版或指向 AGENTS。
- 新增 `docs/architecture/electron-boundaries.md`。
- 新增 `docs/dev/scripts.md` 和 `docs/dev/verification.md`。
- 标注或移走 `vite.renderer.config.mjs`。

验收命令：

```sh
npm run lint
npm run format:check
```

### Phase 1：统一脚本与最低验证路径

目标：给 AI 一个明确的“改完后跑什么”的答案。

建议改动：

- 新增 `build`、`verify`、`verify:package` scripts。
- 为 `report` 增加 `package:analyze` 别名。
- 明确 `package` 与 `make` 的区别。
- 在 docs 中说明 `npm run package` 需要网络下载 Electron/原生依赖，或配置本地缓存/镜像。

验收命令：

```sh
npm run format:check
npm run lint
npm run package
```

### Phase 2：增加类型和接口契约

目标：降低 AI 修改 IPC/preload 时的误判。

建议改动：

- 增加 window global 类型声明。
- 给 main/preload/worker RPC map 增加更稳定的 JSDoc 类型。
- 新增 `typecheck` 命令。
- 将 renderer `jsconfig.json` 的类型策略文档化；是否开启 `checkJs` 需要单独小步评估。

验收命令：

```sh
npm run typecheck
npm run lint
npm run format:check
```

### Phase 3：测试基线

目标：AI 修改后能获得行为级反馈，而不是只靠构建通过。

建议改动：

- 引入 Vitest。
- 优先测试纯函数和深模块：
  - `src/common/dotPathProps.js`
  - `src/common/InMemoryStore.js`
  - `src/main/windowManager/windowHelpers.js` 中的 URL 判断逻辑
  - `src/preload/utils.js` 的 remote API/event 生成逻辑
- 给 IPC channel map 生成逻辑加测试。

验收命令：

```sh
npm test
npm run verify
```

### Phase 4：Electron 冒烟测试与安全回归

目标：覆盖主窗口能启动、preload 正常注入、安全配置不回退。

建议改动：

- 引入 Playwright 或 Electron 专用冒烟测试方案。
- 测试主窗口启动、路由可访问、preload 全局对象存在。
- 断言 renderer 中不能访问 Node 能力。
- 断言 BrowserWindow 默认安全配置。
- 断言外链导航被拦截。

验收命令：

```sh
npm run test:e2e
npm run verify:package
```

### Phase 5：CI 与发布前验证

目标：让 AI、本地开发和 CI 使用同一套验证语言。

建议改动：

- 新增 GitHub Actions 或其他 CI 配置。
- CI 至少运行 `npm ci`、`npm run verify`。
- 发布前或 nightly 运行 `npm run package` / `npm run make`。
- 固化 Electron 下载镜像或缓存策略，避免网络环境漂移。

验收命令：

```sh
npm ci
npm run verify
npm run verify:package
```

## 8. 已发现脚本问题与最小修复建议

### `npm run package`

结果：

- 受限网络环境中失败：
  - `RequestError: getaddrinfo ENOTFOUND npmmirror.com`
- 允许网络访问后通过。

原因：

- Forge packaging 阶段需要下载或准备 Electron/native dependency 相关资源。
- `package-lock.json` 中依赖 resolved URL 大量指向 `registry.npmmirror.com`，网络环境不支持该域名时会失败。

最小修复建议：

- 在 `docs/dev/verification.md` 说明 `npm run package` 需要可访问 Electron/npm 下载源。
- 固化团队使用的 registry/mirror，例如 `.npmrc` 或环境变量，但要避免把个人网络环境写死。
- 如果项目面向国际 CI，考虑重新生成 lockfile 使用 `registry.npmjs.org`，并审查依赖 diff。
- 在 CI 中缓存 Electron/Forge 下载产物，降低网络波动。

### `npm run report`

结果：

- 未单独执行。
- 从配置看，它与 `package` 一样执行 `electron-forge package`，并通过 `npm_lifecycle_event === 'report'` 触发 visualizer。

潜在问题：

- 名称容易让 AI 误以为只是生成报告，实际会执行完整 package。
- 预计具备与 `package` 相同的网络要求。

最小修复建议：

- 增加 `package:analyze` 别名。
- 在 scripts 文档中说明会生成 `states-*.html`，并会执行完整 package。

### `npm run dev`

结果：

- 未执行到完成态，因为这是长驻 GUI 开发命令。

最小修复建议：

- 在验证文档中记录手动验收步骤：
  - 应用窗口能打开。
  - 主窗口路由可切换。
  - DevTools 无 preload error。
  - 终端无 `APP_INIT_ERROR`。

### `npm run make`

结果：

- 未执行。

最小修复建议：

- 在发布文档中说明各平台 maker 产物和依赖。
- 将 `make` 放入发布前验证，而不是每次 AI 小改都执行。

### `npm run publish`

结果：

- 未执行。

原因：

- 发布通常需要凭据、目标仓库、签名或发布渠道上下文。

最小修复建议：

- 在 docs 中说明发布所需环境变量和权限。
- AGENTS.md 中明确 AI 不应主动运行 `publish`，除非用户明确要求。

## 9. 推荐优先级

最值得先做的三件事：

1. 新增 `AGENTS.md`，并填充 main/preload/renderer/worker 边界和验证命令。
2. 新增 `verify`、`build`、`typecheck` 的最小脚本基线。
3. 为 preload 暴露的 `window.__remote*` 对象增加类型/文档，并补一组 IPC 生成逻辑测试。

这三件事完成后，AI coding agent 的工作方式会从“读代码猜约定”变成“按文档找入口、按脚本验证结果”。
