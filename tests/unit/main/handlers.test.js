import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IPC_API_CHANNEL_NAME } from '../../../src/common/constants.js';

const electronMock = vi.hoisted(() => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
}));

const loggerMock = vi.hoisted(() => ({
  debug: vi.fn(),
  error: vi.fn(),
}));

const remoteStoreHandlersMock = vi.hoisted(() => ({
  getGlobalStoreState: vi.fn(),
  setGlobalStore: vi.fn(),
}));

vi.mock('electron', () => electronMock);

vi.mock('../../../src/main/logger.js', () => ({
  default: loggerMock,
}));

vi.mock('../../../src/main/store/index.js', () => ({
  handlers: remoteStoreHandlersMock,
}));

async function loadHandlersModule() {
  return await import('../../../src/main/handlers.js');
}

describe('main handlers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('exposes the registered handler map', async () => {
    const { getMainProcessAPIMap } = await loadHandlersModule();

    expect(getMainProcessAPIMap()).toEqual([
      ['calculator', ['add']],
      ['remoteStore', ['getGlobalStoreState', 'setGlobalStore']],
    ]);
  });

  it('registers invoke and sendSync listeners on the app IPC API channel', async () => {
    const { registerAPIHandlers } = await loadHandlersModule();

    registerAPIHandlers();

    expect(electronMock.ipcMain.handle).toHaveBeenCalledWith(
      IPC_API_CHANNEL_NAME,
      expect.any(Function)
    );
    expect(electronMock.ipcMain.on).toHaveBeenCalledWith(
      IPC_API_CHANNEL_NAME,
      expect.any(Function)
    );
  });

  it('dispatches invoke calls to namespaced handlers', async () => {
    const { registerAPIHandlers } = await loadHandlersModule();
    registerAPIHandlers();
    const invokeCallback = electronMock.ipcMain.handle.mock.calls[0][1];

    await expect(invokeCallback({ sender: 'renderer' }, 'calculator::add', 2, 3)).resolves.toBe(5);
    expect(loggerMock.debug).toHaveBeenCalledWith('[ipc-api]', 'calculator::add', [2, 3]);
    expect(loggerMock.debug).toHaveBeenCalledWith('[ipc-api]', 'calculator::add', 'Done');
  });

  it('dispatches sendSync calls and writes the returnValue', async () => {
    remoteStoreHandlersMock.getGlobalStoreState.mockResolvedValue({ user: { name: 'Ada' } });
    const { registerAPIHandlers } = await loadHandlersModule();
    registerAPIHandlers();
    const event = {};
    const syncCallback = electronMock.ipcMain.on.mock.calls[0][1];

    syncCallback(event, 'remoteStore::getGlobalStoreState');
    await vi.waitFor(() => {
      expect(event.returnValue).toEqual({ user: { name: 'Ada' } });
    });
    expect(remoteStoreHandlersMock.getGlobalStoreState).toHaveBeenCalledWith(event);
  });

  it('logs invalid or unknown IPC channels without throwing', async () => {
    const { registerAPIHandlers } = await loadHandlersModule();
    registerAPIHandlers();
    const invokeCallback = electronMock.ipcMain.handle.mock.calls[0][1];

    await expect(invokeCallback({}, null)).resolves.toBeUndefined();
    await expect(invokeCallback({}, 'missing::handler')).resolves.toBeUndefined();

    expect(loggerMock.error).toHaveBeenCalledWith(
      'Invalid IPC message received. Channel name is missing or invalid.'
    );
    expect(loggerMock.error).toHaveBeenCalledWith(
      'No handler found for the given channel: ',
      'missing::handler'
    );
  });
});
