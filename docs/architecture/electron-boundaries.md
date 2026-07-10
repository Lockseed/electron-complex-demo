# Electron Process Boundaries

This document describes the process seams that AI coding agents should preserve while changing the app.

## Process Map

```text
main process
  creates windows
  registers protocols, menus, IPC, stores, utility worker
  owns native Electron and OS capabilities

preload
  runs between Electron and renderer
  exposes a small interface through contextBridge
  adapts IPC and worker RPC into renderer-safe globals

renderer
  runs Vue UI
  has no direct Node or Electron access
  uses only preload-exposed globals for native capabilities

utility worker
  runs heavier IO/CPU tasks
  talks to main through async-call-rpc
  talks to renderer through MessageChannelMain and preload adapters
```

## Main Process

Main starts at `src/main/main.js`.

Startup order matters:

1. Set application paths.
2. Initialize logger.
3. Ensure single instance.
4. Apply command-line switches.
5. Initialize i18n.
6. Register protocol, IPC handlers, events, store, worker, windows, and menu after `app.whenReady()`.

Main owns Electron APIs, filesystem-facing decisions, shell access, URL handling, app paths, and window creation.

When adding native behavior, prefer putting the implementation in main or worker and exposing only a small renderer-facing interface through preload.

## Preload

Preload starts at `src/preload/preload.js`.

It exposes these renderer globals:

- `window.__remoteAPIs`
- `window.__remoteEvents`
- `window.__remoteStores`

Preload may import `electron` and use `ipcRenderer`, but it must not expose `ipcRenderer` itself. Exposed values should be narrow callable functions or subscription functions.

The shared TypeScript contract for these globals lives in `src/common/remote-contracts.d.ts`. The renderer-facing `Window` augmentation lives in `src/renderer/global.d.ts`.

## Renderer

Main renderer starts at `src/renderer/main/main.js`.

Secondary renderer starts at `src/renderer/secondary/main.js`.

Renderer code should stay UI-focused:

- Do not import `electron`.
- Do not import Node built-ins such as `fs`, `path`, or `child_process`.
- Do not import from `src/main`, `src/preload`, or `src/worker`.
- Do not construct raw IPC channel names in views.
- Route and component failures should be caught at the root Vue app, with user-facing fallback UI in renderer and structured error logging through `electron-log`.

If renderer needs a new native capability, add a named interface through main/worker plus preload.

## Worker

Worker starts at `src/worker/worker.js` and is launched by `src/main/workerManager.js` using Electron `utilityProcess`.

Use worker for work that should not block the main process, such as heavier file or CPU operations. Keep window management, menus, protocols, and app lifecycle in main.

Worker APIs are registered in `src/worker/handlers.js`. Worker events are registered in `src/worker/events.js`.

## IPC And RPC Rules

Main-process request handlers live behind `src/main/handlers.js`.

Main-process events live behind `src/main/events.js`.

Worker request handlers live behind `src/worker/handlers.js`.

Channel names use:

```text
namespace::name
```

Examples:

- `calculator::add`
- `remoteStore::getGlobalStoreState`
- `fileService::calculateChecksum`

Rules for new handlers:

- Use a clear namespace.
- Validate all renderer-provided input.
- Return serializable values.
- Avoid passing Electron objects across process seams.
- Log failures at the owning process.
- Keep filesystem, shell, URL, protocol, and OS access behind explicit allowlists.

## Security Baseline

Window creation currently uses:

```js
webPreferences: {
  sandbox: true,
  contextIsolation: true,
  nodeIntegration: false,
  nodeIntegrationInWorker: false,
}
```

These settings are part of the app's safety baseline. Do not weaken them without updating this document and explaining the replacement control.

Other safety mechanisms:

- `contextBridge` is used instead of exposing Electron primitives.
- `setWindowOpenHandler` denies new windows by default.
- `will-navigate` intercepts non-internal navigation.
- `protocol.handle('file')` restricts file access to app/user-data locations.
- Forge fuses disable Node-as-app, `NODE_OPTIONS`, and CLI inspect arguments in packaged apps.

`npm run test:e2e` covers the current Electron smoke/security baseline for preload globals, renderer Node isolation, BrowserWindow preferences, and external navigation interception.

## Common Change Recipes

### Add a renderer-callable main function

1. Add implementation in a main-owned module.
2. Export it through `allHandlers` in `src/main/handlers.js`.
3. Validate inputs before native work.
4. Use it from renderer through `window.__remoteAPIs.namespace.method()`.
5. Update `src/common/remote-contracts.d.ts` and `src/renderer/global.d.ts` if the exposed interface changes.
6. Verify with `npm run verify`, or `npm run verify:package` for boundary/security changes.

### Add a worker function

1. Add implementation under `src/worker/`.
2. Export it through `allWorkerHandlers` in `src/worker/handlers.js`.
3. Keep arguments/results serializable.
4. Use it from renderer through the generated worker remote API.
5. Add or update focused unit tests when the worker logic can be tested without launching Electron.
6. Verify with packaging because worker bundles are separate Forge/Vite targets.

### Add a renderer route or view

1. Work under `src/renderer/main/`.
2. Register routes in `src/renderer/main/router/index.js`.
3. Use Tailwind 4 and daisyUI 5 conventions from `.github/instructions/daisyui.instructions.md`.
4. Do not introduce direct Electron/Node imports.
