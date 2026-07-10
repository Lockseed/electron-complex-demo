import { beforeEach, describe, expect, it, vi } from 'vitest';

const storeMock = vi.hoisted(() => ({
  onDidAnyChange: vi.fn(),
}));

vi.mock('../../../../src/main/store/global.js', () => ({
  whenGlobalStoreReady: Promise.resolve(storeMock),
}));

async function loadStoreEvents() {
  return await import('../../../../src/main/store/events.js');
}

describe('store events', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('subscribes to global store changes after the store is ready', async () => {
    const unsubscribe = vi.fn();
    storeMock.onDidAnyChange.mockReturnValue(unsubscribe);
    const callback = vi.fn();
    const { default: events } = await loadStoreEvents();

    const unregister = events.onGlobalStoreChanged(callback);
    await vi.waitFor(() => {
      expect(storeMock.onDidAnyChange).toHaveBeenCalledWith(callback);
    });
    unregister();

    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('allows unregistering before the async subscription has been created', async () => {
    const { default: events } = await loadStoreEvents();

    expect(() => events.onGlobalStoreChanged(vi.fn())()).not.toThrow();
  });
});
