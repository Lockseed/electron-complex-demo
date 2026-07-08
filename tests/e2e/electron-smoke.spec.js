import { _electron as electron, expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const electronExecutablePath = /** @type {string} */ (/** @type {unknown} */ (require('electron')));

async function launchBuiltApp() {
  const mainPath = join(process.cwd(), '.vite', 'build', 'main.mjs');

  if (!existsSync(mainPath)) {
    throw new Error(
      `Built Electron main file not found at ${mainPath}. Run "npm run package" first.`
    );
  }

  return await electron.launch({
    executablePath: electronExecutablePath,
    args: [mainPath],
    env: {
      ...process.env,
      ELECTRON_IS_DEV: '0',
      NODE_ENV: 'production',
    },
  });
}

async function waitForMainWindow(electronApp) {
  await expect
    .poll(
      () =>
        electronApp.evaluate(({ BrowserWindow }) => {
          return BrowserWindow.getAllWindows().some((win) => {
            const webContents = win.webContents;
            return webContents.getURL().includes('index.html') && !webContents.isLoadingMainFrame();
          });
        }),
      { timeout: 30_000 }
    )
    .toBe(true);
}

async function getMainWindowUrl(electronApp) {
  return await electronApp.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows().find((win) =>
      win.webContents.getURL().includes('index.html')
    );
    return win.webContents.getURL();
  });
}

async function evaluateInMainWindow(electronApp, fn, arg) {
  return await electronApp.evaluate(
    async ({ BrowserWindow }, { fnSource, arg }) => {
      const win = BrowserWindow.getAllWindows().find((win) =>
        win.webContents.getURL().includes('index.html')
      );
      return await win.webContents.executeJavaScript(`(${fnSource})(${JSON.stringify(arg)})`);
    },
    {
      fnSource: fn.toString(),
      arg,
    }
  );
}

async function closeElectronApp(electronApp) {
  try {
    await electronApp.evaluate(({ app }) => {
      app.exit(0);
    });
  } catch (_) {
    await electronApp.close();
  }
}

test.describe('built Electron app smoke', () => {
  /** @type {import('@playwright/test').ElectronApplication | undefined} */
  let electronApp;

  test.beforeEach(async () => {
    electronApp = await launchBuiltApp();
    await waitForMainWindow(electronApp);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await closeElectronApp(electronApp);
    }
  });

  test('opens the main window and injects the preload contract', async () => {
    const windowState = await evaluateInMainWindow(electronApp, () => ({
      readyState: document.readyState,
      url: window.location.href,
    }));

    expect(windowState).toMatchObject({
      readyState: 'complete',
    });
    expect(windowState.url).toContain('index.html');

    await evaluateInMainWindow(electronApp, () => {
      window.location.hash = '#/about';
    });
    await expect
      .poll(() => evaluateInMainWindow(electronApp, () => window.location.hash))
      .toBe('#/about');

    const preloadState = await evaluateInMainWindow(electronApp, async () => {
      const appWindow = /** @type {any} */ (window);
      const sum = await appWindow.__remoteAPIs.calculator.add(2, 3);

      return {
        hasRemoteAPIs: typeof appWindow.__remoteAPIs === 'object',
        hasRemoteEvents: typeof appWindow.__remoteEvents === 'object',
        hasRemoteStores: typeof appWindow.__remoteStores === 'object',
        sum,
      };
    });

    expect(preloadState).toEqual({
      hasRemoteAPIs: true,
      hasRemoteEvents: true,
      hasRemoteStores: true,
      sum: 5,
    });
  });

  test('keeps renderer Node integration disabled', async () => {
    const rendererGlobals = await evaluateInMainWindow(electronApp, () => ({
      processType: typeof window.process,
      requireType: typeof window.require,
      bufferType: typeof window.Buffer,
    }));

    expect(rendererGlobals).toEqual({
      processType: 'undefined',
      requireType: 'undefined',
      bufferType: 'undefined',
    });
  });

  test('keeps BrowserWindow security preferences enabled', async () => {
    const preferences = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      const webPreferences = /** @type {any} */ (win.webContents).getLastWebPreferences();
      return {
        sandbox: webPreferences.sandbox,
        contextIsolation: webPreferences.contextIsolation,
        nodeIntegration: webPreferences.nodeIntegration,
        nodeIntegrationInWorker: webPreferences.nodeIntegrationInWorker ?? false,
      };
    });

    expect(preferences).toMatchObject({
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
    });
  });

  test('blocks non-internal navigation and routes it to shell.openExternal', async () => {
    const originalUrl = await getMainWindowUrl(electronApp);
    const externalUrl = 'https://example.com/electron-e2e-external-navigation';

    await electronApp.evaluate(({ shell }) => {
      const e2eGlobal = /** @type {any} */ (globalThis);
      e2eGlobal.__e2eOpenedExternalUrls = [];
      shell.openExternal = async (url) => {
        e2eGlobal.__e2eOpenedExternalUrls.push(url);
      };
    });

    await evaluateInMainWindow(
      electronApp,
      (url) => {
        window.location.href = url;
      },
      externalUrl
    );

    await expect.poll(() => getMainWindowUrl(electronApp)).toBe(originalUrl);

    const openedExternalUrls = await electronApp.evaluate(
      () => /** @type {any} */ (globalThis).__e2eOpenedExternalUrls
    );
    expect(openedExternalUrls).toEqual([externalUrl]);
  });
});
