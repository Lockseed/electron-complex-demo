import { beforeEach, describe, expect, it, vi } from 'vitest';

const electronMock = vi.hoisted(() => ({
  app: {
    getPath: vi.fn(() => '/tmp/electron-complex-demo-test'),
  },
}));

const storeConstructorMock = vi.hoisted(() =>
  vi.fn(function StoreMock(options) {
    this.options = options;
    this.get = vi.fn((_key, defaultValue) => defaultValue);
    this.set = vi.fn();
    this.openInEditor = vi.fn(() => 'opened');
  })
);

vi.mock('electron', () => electronMock);

vi.mock('electron-store', () => ({
  default: storeConstructorMock,
}));

async function loadGlobalStore() {
  return await import('../../../../src/main/store/global.js');
}

describe('global store', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('initializes electron-store using the app userData path', async () => {
    const { initGlobalStore, whenGlobalStoreReady } = await loadGlobalStore();

    initGlobalStore();
    const store = await whenGlobalStoreReady;

    expect(electronMock.app.getPath).toHaveBeenCalledWith('userData');
    expect(storeConstructorMock).toHaveBeenCalledWith({
      name: 'global-config',
      cwd: '/tmp/electron-complex-demo-test',
    });
    expect(store).toBe(storeConstructorMock.mock.instances[0]);
  });

  it('requires initialization before reading or writing window state', async () => {
    const { getMainWindowState, setMainWindowState } = await loadGlobalStore();

    expect(() => getMainWindowState()).toThrow('GlobalStore not initialized');
    expect(() => setMainWindowState({ width: 1, height: 1, x: 0, y: 0 })).toThrow(
      'GlobalStore not initialized'
    );
  });

  it('delegates window state and editor operations to the initialized store', async () => {
    const { getMainWindowState, initGlobalStore, openGlobalStoreFile, setMainWindowState } =
      await loadGlobalStore();
    const windowState = { width: 1024, height: 768, x: 20, y: 40 };

    initGlobalStore();
    const store = storeConstructorMock.mock.instances[0];
    setMainWindowState(windowState);
    const defaultState = { width: 800, height: 600, x: 0, y: 0 };
    getMainWindowState(defaultState);

    expect(store.set).toHaveBeenCalledWith('mainWindowState', windowState);
    expect(store.get).toHaveBeenCalledWith('mainWindowState', defaultState);
    expect(openGlobalStoreFile()).toBe('opened');
    expect(store.openInEditor).toHaveBeenCalledOnce();
  });
});
