# NPM Scripts

This project uses npm scripts as the shared language for humans, CI, and AI agents.

## Existing Scripts

### `npm ci`

Installs dependencies from `package-lock.json`.

The `preinstall` script runs `scripts/checkNodeVersion.cjs`, which requires Node `>=22.0.0 <23.0.0`.

### `npm run dev`

Runs `electron-forge start`.

Use this for local interactive development. It starts the Electron app and stays running.

Manual checks:

- Main window opens.
- DevTools do not show preload errors.
- Terminal does not show `APP_INIT_ERROR`.
- Basic routing in the main renderer works.

### `npm run build`

Runs `electron-forge package`.

This is a conventional alias for production packaging so humans and AI agents have a familiar build entry point.

### `npm run package`

Runs `electron-forge package`.

This builds main, preload, worker, and renderer Vite bundles, then packages the app directory under `out/`.

This command may need network access for Electron/Forge downloads or native dependency preparation.

### `npm run package:analyze`

Runs `npm run report`.

Use this clearer alias when you want bundle visualizer output. It intentionally delegates to `report` because the current Vite configs enable `rollup-plugin-visualizer` when the npm lifecycle event is `report`.

### `npm run report`

Runs `electron-forge package` with `npm_lifecycle_event` equal to `report`.

The Vite configs use that lifecycle event to enable `rollup-plugin-visualizer` and generate `states-*.html` reports.

This is not a lightweight docs command. Treat it as package plus bundle analysis.

### `npm run make`

Runs `electron-forge make`.

Use this when installer/package artifacts are needed. It is heavier than `package` and may depend on host platform tooling.

### `npm run publish`

Runs `electron-forge publish`.

Do not run this unless the user explicitly asks for a publish and the required credentials/environment are known.

### `npm run lint`

Runs ESLint across the repository.

This is part of the baseline verification path for every change.

### `npm run lint:fix`

Runs ESLint with `--fix`.

Review the diff after running it.

### `npm run format`

Runs Prettier write mode.

Review the diff after running it.

### `npm run format:check`

Runs Prettier check mode.

This is part of the baseline verification path for every change.

### `npm run typecheck`

Runs:

```sh
tsc --noEmit -p tsconfig.electron.json && vue-tsc --noEmit -p src/renderer/tsconfig.json
```

The Electron config checks `src/main`, `src/preload`, `src/worker`, and `src/common` as strict TypeScript. The renderer config checks renderer TypeScript plus Vue SFCs through `vue-tsc`.

### `npm test`

Runs:

```sh
vitest run
```

The current unit test baseline covers:

- `src/common/dotPathProps.js`
- `src/common/InMemoryStore.js`
- `src/preload/utils.js`

### `npm run test:watch`

Runs Vitest in watch mode for local development.

### `npm run test:e2e`

Runs:

```sh
playwright test
```

This launches Electron through Playwright and loads `.vite/build/main.mjs`. Run `npm run package` first, or use `npm run verify:package`, so Forge/Vite build output exists.

The current Electron smoke baseline checks:

- Main window startup against the built renderer entry.
- Hash route accessibility.
- Preload globals and a sample remote API call.
- Renderer Node globals stay unavailable.
- BrowserWindow security preferences stay enabled.
- Non-internal navigation is blocked and routed through `shell.openExternal`.

### `npm run verify`

Runs:

```sh
npm run format:check && npm run lint && npm run typecheck && npm test
```

This is the current minimum verification path.

### `npm run verify:package`

Runs:

```sh
npm run verify && npm run package && npm run test:e2e
```

Use this for Electron process, preload, worker, Forge, packaging, IPC, or navigation/security changes.

## Future Recommended Scripts

This remains intentionally unimplemented until the matching tool and config exist.

```json
{
  "test:web": "playwright test --config playwright.web.config.mjs"
}
```

If a browser-based web E2E suite is added later, keep it separate from the Electron smoke suite unless it is fast and stable enough for every local change.

Current baseline:

```sh
npm run verify
```

For Electron process-boundary changes, also run:

```sh
npm run verify:package
```
