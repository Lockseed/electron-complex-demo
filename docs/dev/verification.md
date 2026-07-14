# Verification Guide

Use this guide to choose the right verification path after a change.

CI runs these paths in `.github/workflows/ci.yml`. See `docs/dev/ci.md` for runner and registry details.

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

`npm run verify` currently runs format check plus lint plus strict TypeScript and Vue typecheck plus unit tests.

## Electron Boundary Changes

For changes touching these areas, run the baseline plus packaging and Electron smoke tests:

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

`npm run package` may need network access. `npm run test:e2e` launches Electron through Playwright and needs a GUI-capable environment. A known failure mode is DNS/network failure for registry or Electron download hosts, for example `getaddrinfo ENOTFOUND npmmirror.com`.

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

- Format check, lint, typecheck, and unit tests pass.
- Vite builds main, preload, worker, and renderer targets.
- Electron Forge packages for the local platform.
- Playwright launches Electron and runs the smoke/security checks.
- Output appears under `out/`.

Known non-fatal warning:

- Tailwind/daisyUI generated CSS may report an unknown `@property` optimization warning for `--radialprogress`.

Known environment issue:

- Packaging can fail if the configured npm/Electron mirror is unreachable. This is an environment/download issue if Vite targets finished building and the failure is in Forge copying/preparing native dependencies.

## Commands Not To Run Casually

- `npm run publish`: requires explicit user request and publishing credentials.
- `npm run make`: use when installer artifacts are needed; it is heavier than normal validation.

## Release Candidate Check

Before publishing or handing a release candidate to another machine, run:

```sh
npm ci
npm run verify:package
```

For installer artifacts, also run:

```sh
npm run make
```

## Generated Files

Do not edit generated output manually:

- `.vite/`
- `out/`
- `.temp/`
- `states-*.html`
- `node_modules/`
