# CI And Release Verification

The project uses GitHub Actions as the shared CI path for humans and AI agents.

## Workflow

Workflow file:

- `.github/workflows/ci.yml`

Triggers:

- Pull requests.
- Pushes to `main`.

Concurrency:

- New commits cancel older runs for the same branch or PR.

## Jobs

### Verify

Runner:

- `ubuntu-latest`

Commands:

```sh
npm ci
npm run verify
```

This covers formatting, lint, typecheck, and unit tests.

### Package And Electron Smoke

Runner:

- `macos-latest`

Commands:

```sh
npm ci
npm run verify:package
```

This covers the baseline verification, Electron Forge package, and Playwright Electron smoke/security tests.

The package smoke job runs after the verify job so fast failures arrive earlier.

## Registry Policy

The lockfile currently contains resolved URLs from `registry.npmmirror.com`. CI sets:

```sh
NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
NPM_CONFIG_REPLACE_REGISTRY_HOST=always
```

This keeps CI independent from a local mirror while preserving the checked-in lockfile.

## Local Pre-Release Checklist

Before publishing or handing a release candidate to another machine, run:

```sh
npm ci
npm run verify:package
```

For installer artifacts, also run:

```sh
npm run make
```

Do not run `npm run publish` unless the release target, credentials, and signing/publishing environment are known.

## Known Notes

- `npm run verify:package` may need network access for Electron/Forge downloads.
- `npm run test:e2e` launches Electron through Playwright and needs a GUI-capable environment.
- The Tailwind/daisyUI `@property --radialprogress` warning during package builds is currently expected.
