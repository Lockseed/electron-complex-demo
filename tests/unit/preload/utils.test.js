import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createRemoteAPI,
  createRemoteEvent,
  parseProcessArgv,
} from '../../../src/preload/utils.js';

const originalArgv = process.argv;

afterEach(() => {
  process.argv = originalArgv;
  vi.restoreAllMocks();
});

describe('parseProcessArgv', () => {
  it('parses JSON payloads from matching preload argv entries', () => {
    process.argv = ['electron', 'preload', '--event-map=[["appEvents",["onAppActivate"]]]'];

    expect(parseProcessArgv('--event-map')).toEqual([['appEvents', ['onAppActivate']]]);
  });

  it('returns null for missing or malformed argv entries', () => {
    process.argv = ['electron', 'preload'];
    expect(parseProcessArgv('--api-map')).toBeNull();

    process.argv = ['electron', 'preload', '--api-map=not-json'];
    expect(parseProcessArgv('--api-map')).toBeNull();
  });
});

describe('createRemoteAPI', () => {
  it('creates nested API callers that pass fully qualified channels to the IPC caller', async () => {
    const ipcRendererInvoke = vi.fn(async (channel, ...args) => ({ channel, args }));
    const api = /** @type {any} */ (
      createRemoteAPI(
        [
          ['calculator', ['add']],
          ['remoteStore', ['getGlobalStoreState']],
        ],
        ipcRendererInvoke,
        { tag: 'unit' }
      )
    );

    await expect(api.calculator.add(1, 2)).resolves.toEqual({
      channel: 'calculator::add',
      args: [1, 2],
    });
    await api.remoteStore.getGlobalStoreState();

    expect(ipcRendererInvoke).toHaveBeenCalledWith('calculator::add', 1, 2);
    expect(ipcRendererInvoke).toHaveBeenCalledWith('remoteStore::getGlobalStoreState');
  });

  it('returns an empty object and warns when the API map is invalid', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(createRemoteAPI(null, vi.fn(), { tag: 'unit' })).toEqual({});
    expect(console.warn).toHaveBeenCalledWith('[createRemoteAPI][unit] Invalid apiMap.');
  });

  it('skips namespaces with invalid handler names', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(
      createRemoteAPI(
        /** @type {any} */ ([
          ['valid', ['read']],
          ['invalid', ['read', 123]],
        ]),
        vi.fn(),
        { tag: 'unit' }
      )
    ).toEqual({
      valid: {
        read: expect.any(Function),
      },
    });
    expect(console.error).toHaveBeenCalledWith(
      '[createRemoteAPI][unit] Invalid handlerName for namespace: invalid'
    );
  });
});

describe('createRemoteEvent', () => {
  it('creates nested event subscriptions that register fully qualified channels', () => {
    const unregister = vi.fn();
    const ipcRendererOn = vi.fn((channel) => (listener) => {
      listener(channel, 'payload');
      return unregister;
    });
    const listener = vi.fn();

    const events = /** @type {any} */ (
      createRemoteEvent([['appEvents', ['onAppActivate']]], ipcRendererOn, {
        tag: 'unit',
      })
    );
    const returnedUnregister = events.appEvents.onAppActivate(listener);

    expect(ipcRendererOn).toHaveBeenCalledWith('appEvents::onAppActivate');
    expect(listener).toHaveBeenCalledWith('appEvents::onAppActivate', 'payload');
    expect(returnedUnregister).toBe(unregister);
  });

  it('returns an empty object and warns when the event map is invalid', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(createRemoteEvent(null, vi.fn(), { tag: 'unit' })).toEqual({});
    expect(console.warn).toHaveBeenCalledWith('[createRemoteEvent][unit] Invalid eventMap.');
  });

  it('skips namespaces with invalid event names', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(
      createRemoteEvent(
        /** @type {any} */ ([
          ['valid', ['changed']],
          ['invalid', ['changed', false]],
        ]),
        vi.fn(() => () => vi.fn()),
        { tag: 'unit' }
      )
    ).toEqual({
      valid: {
        changed: expect.any(Function),
      },
    });
    expect(console.error).toHaveBeenCalledWith(
      '[createRemoteEvent][unit] Invalid eventName for namespace: invalid'
    );
  });
});
