import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRemoteAPI, createRemoteEvent, parseProcessArgv } from './utils.js';

const originalArgv = process.argv;

afterEach(() => {
  process.argv = originalArgv;
  vi.restoreAllMocks();
});

describe('parseProcessArgv', () => {
  it('parses a JSON value from a matching process argument', () => {
    process.argv = ['node', 'preload', '--api-map=[["calculator",["add"]]]'];

    expect(parseProcessArgv('--api-map')).toEqual([['calculator', ['add']]]);
  });

  it('returns null when the argument is absent or invalid', () => {
    process.argv = ['node', 'preload'];
    expect(parseProcessArgv('--api-map')).toBeNull();

    process.argv = ['node', 'preload', '--api-map=not-json'];
    expect(parseProcessArgv('--api-map')).toBeNull();
  });
});

describe('createRemoteAPI', () => {
  it('creates namespaced callers from an API map', async () => {
    const caller = vi.fn(async (channel, ...args) => ({ channel, args }));

    const apis = /** @type {any} */ (createRemoteAPI([['calculator', ['add']]], caller));

    await expect(apis.calculator.add(1, 2)).resolves.toEqual({
      channel: 'calculator::add',
      args: [1, 2],
    });
    expect(caller).toHaveBeenCalledWith('calculator::add', 1, 2);
  });

  it('skips invalid handler maps', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const apis = createRemoteAPI(/** @type {any} */ ([['bad', 'not-an-array']]), async () => {});

    expect(apis).toEqual({});
  });
});

describe('createRemoteEvent', () => {
  it('creates namespaced event subscriptions from an event map', () => {
    const register = vi.fn((channel) => (listener) => {
      listener(channel);
      return () => {};
    });
    const listener = vi.fn();

    const events = /** @type {any} */ (
      createRemoteEvent([['debug', ['onTriggerRendererProcessGone']]], register)
    );
    const unsubscribe = events.debug.onTriggerRendererProcessGone(listener);

    expect(register).toHaveBeenCalledWith('debug::onTriggerRendererProcessGone');
    expect(listener).toHaveBeenCalledWith('debug::onTriggerRendererProcessGone');
    expect(unsubscribe).toEqual(expect.any(Function));
  });

  it('returns an empty object for invalid event maps', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(createRemoteEvent(null, () => (_listener) => () => {})).toEqual({});
  });
});
