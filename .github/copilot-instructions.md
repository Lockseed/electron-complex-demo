# AI Coding Instructions

Start with `AGENTS.md` at the repository root. It contains the current project map, Electron process rules, security baseline, and verification commands.

Key rules:

- Renderer code must not import Electron, Node built-ins, or implementation modules from `src/main`, `src/preload`, or `src/worker`.
- Renderer code should use only preload-exposed globals for native capabilities.
- Preload must not expose `ipcRenderer` directly.
- Keep BrowserWindow security settings enabled: `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, and `nodeIntegrationInWorker: false`.
- Actual renderer Vite configs live under `src/renderer/*/vite.config.js`; root `vite.renderer.config.mjs` is a historical example only.
- Run `npm run verify` before finishing ordinary changes.
- For Electron process, preload, worker, Forge, or packaging changes, also run `npm run verify:package`.

For Vue, Tailwind, and daisyUI work, also follow `.github/instructions/daisyui.instructions.md`.
