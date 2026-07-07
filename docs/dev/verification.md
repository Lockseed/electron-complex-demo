# Verification Guide

Use this guide to choose the right verification path after a change.

## Baseline For Documentation-Only Changes

Run:

```sh
npm run verify
```

If the docs mention commands, paths, or generated files, also run the relevant read-only command such as `npm run` or `rg`.

## Baseline For Code Changes

Run:

```sh
npm run verify
```

`npm run verify` currently runs format check plus lint. There is not yet a test or typecheck script.

## Electron Boundary Changes

For changes touching these areas, run the baseline plus `npm run package`:

- `forge.config.mjs`
- `vite.*.config.mjs`
- `src/main/`
- `src/preload/`
- `src/worker/`
- BrowserWindow `webPreferences`
- IPC handlers/events
- protocol or URL handling
- package or Forge scripts

Command:

```sh
npm run verify:package
```

`npm run package` may need network access. A known failure mode is DNS/network failure for registry or Electron download hosts, for example `getaddrinfo ENOTFOUND npmmirror.com`.

## Manual Dev Smoke Check

Use this when changing renderer UI, routing, preload exposure, app startup, or window behavior.

Run:

```sh
npm run dev
```

Check:

- The app opens a main window.
- The main route renders.
- Navigation between visible routes works.
- DevTools show no preload errors.
- Terminal logs do not show `APP_INIT_ERROR`.
- Renderer does not rely on direct Node or Electron globals.

Stop the dev process when finished.

## Packaging Smoke Check

Run:

```sh
npm run verify:package
```

Expected result:

- Format check and lint pass.
- Vite builds main, preload, worker, and renderer targets.
- Electron Forge packages for the local platform.
- Output appears under `out/`.

Known non-fatal warning:

- Tailwind/daisyUI generated CSS may report an unknown `@property` optimization warning for `--radialprogress`.

Known environment issue:

- Packaging can fail if the configured npm/Electron mirror is unreachable. This is an environment/download issue if Vite targets finished building and the failure is in Forge copying/preparing native dependencies.

## Commands Not To Run Casually

- `npm run publish`: requires explicit user request and publishing credentials.
- `npm run make`: use when installer artifacts are needed; it is heavier than normal validation.

## Generated Files

Do not edit generated output manually:

- `.vite/`
- `out/`
- `.temp/`
- `states-*.html`
- `node_modules/`
