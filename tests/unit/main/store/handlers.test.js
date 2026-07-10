import { beforeEach, describe, expect, it, vi } from 'vitest';

const storeMock = vi.hoisted(() => ({
  store: { user: { name: 'Ada' } },
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
}));

vi.mock('../../../../src/main/store/global.js', () => ({
  whenGlobalStoreReady: Promise.resolve(storeMock),
}));

async function loadStoreHandlers() {
  return await import('../../../../src/main/store/handlers.js');
}

describe('store handlers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns a snapshot of the global store state', async () => {
    const { default: handlers } = await loadStoreHandlers();

    await expect(handlers.getGlobalStoreState()).resolves.toEqual({ user: { name: 'Ada' } });
  });

  it('sets a global store key or object patch', async () => {
    const { default: handlers } = await loadStoreHandlers();

    await handlers.setGlobalStore('user.name', 'Grace');
    await handlers.setGlobalStore({ theme: 'dark' });

    expect(storeMock.set).toHaveBeenCalledWith('user.name', 'Grace');
    expect(storeMock.set).toHaveBeenCalledWith({ theme: 'dark' }, undefined);
  });

  it('deletes and clears global store state', async () => {
    const { default: handlers } = await loadStoreHandlers();

    await handlers.deleteGlobalStore('user.name');
    await handlers.clearGlobalStore();

    expect(storeMock.delete).toHaveBeenCalledWith('user.name');
    expect(storeMock.clear).toHaveBeenCalledOnce();
  });
});
