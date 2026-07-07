# AGENTS.md

This file is the first stop for AI coding agents and new maintainers working in this repository.

## Project Shape

This is an Electron Forge + Vite + Vue 3 demo application.

- `src/main/`: Electron main process. Owns app startup, windows, protocol handling, menus, IPC handlers/events, store setup, and worker lifecycle.
- `src/preload/`: preload bridge. Owns the small interface exposed from Electron to renderer code through `contextBridge`.
- `src/renderer/main/`: main Vue renderer window.
- `src/renderer/secondary/`: secondary renderer window used as a small demo/test window.
- `src/worker/`: Electron `utilityProcess` worker for heavier IO/CPU work.
- `src/common/`: code shared across processes.
- `docs/architecture/`: architecture notes and process-seam rules.
- `docs/dev/`: scripts and verification notes.

## Actual Build Entries

Electron Forge reads `forge.config.mjs`.

- Main entry: `src/main/main.js`
- Worker entry: `src/worker/worker.js`
- Preload entry: `src/preload/preload.js`
- Main renderer config: `src/renderer/main/vite.config.js`
- Secondary renderer config: `src/renderer/secondary/vite.config.js`

`vite.renderer.config.mjs` is only a historical example. Do not edit it when changing actual renderer builds.

## Commands

- Install: `npm ci`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Format check: `npm run format:check`
- Package app directory: `npm run package`
- Analyze package: `npm run report`
- Make installers/packages: `npm run make`

Before finishing ordinary code or docs changes, run:

```sh
npm run lint
npm run format:check
```

For Electron startup, preload, IPC, worker, Forge, or packaging changes, also run:

```sh
npm run package
```

`npm run package` may need network access for Electron/Forge downloads or native dependency preparation.

## Architecture Rules

- Renderer code must not import `electron`, Node built-ins, or main/preload/worker implementation modules.
- Renderer code talks to Electron capabilities only through preload-exposed globals.
- Preload must not expose `ipcRenderer` directly.
- Keep exposed preload interfaces small, explicit, and documented.
- Add main-process request handlers through `src/main/handlers.js` or a module exported from it.
- Add main-process events through `src/main/events.js` or a module exported from it.
- Add worker callable functions through `src/worker/handlers.js`.
- Use namespaced channel names in the shape `namespace::methodName` or `namespace::eventName`.
- Validate renderer-provided input before filesystem, shell, network, URL, protocol, or OS access.
- Prefer changes at existing seams over adding parallel implementations.

## Electron Security Rules

Keep these BrowserWindow defaults unless there is a reviewed architecture change:

- `sandbox: true`
- `contextIsolation: true`
- `nodeIntegration: false`
- `nodeIntegrationInWorker: false`

Do not weaken Forge fuses in `forge.config.mjs` without documenting why.

Do not allow arbitrary external protocols, arbitrary `file://` paths, or renderer-selected IPC channels.

## Documentation Rules

- Update `docs/architecture/electron-boundaries.md` when changing main/preload/renderer/worker responsibilities.
- Update `docs/dev/scripts.md` when adding or changing npm scripts.
- Update `docs/dev/verification.md` when changing verification commands or expected manual checks.
- Update preload global type/docs when changing `window.__remoteAPIs`, `window.__remoteEvents`, or `window.__remoteStores`.

## Generated And Local Files

Do not edit generated or local output directories:

- `.vite/`
- `out/`
- `.temp/`
- `states-*.html`
- `node_modules/`

Treat `package-lock.json` as source of truth unless explicitly changing dependencies.

## Current Gaps

The repository currently has no test, typecheck, or aggregate verify script. Until those are added, use `npm run lint`, `npm run format:check`, and targeted manual Electron checks as the baseline.
