import { describe, expect, it, vi } from 'vitest';

import InMemoryStore from './InMemoryStore.js';

describe('InMemoryStore', () => {
  it('reads defaults and nested keys', () => {
    const store = new InMemoryStore({
      defaults: {
        user: {
          name: 'Ada',
        },
      },
    });

    expect(store.get('user.name')).toBe('Ada');
    expect(store.get('user.age', 36)).toBe(36);
  });

  it('sets nested keys and plain-object patches', () => {
    const store = new InMemoryStore();

    store.set('user.name', 'Ada');
    store.set({
      'user.location': 'London',
      'projects[0].id': 'alpha',
    });

    expect(store.store).toEqual({
      user: {
        name: 'Ada',
        location: 'London',
      },
      projects: [{ id: 'alpha' }],
    });
  });

  it('returns a cloned snapshot from store', () => {
    const store = new InMemoryStore({
      defaults: {
        user: {
          name: 'Ada',
        },
      },
    });

    const snapshot = store.store as { user: { name: string } };
    snapshot.user.name = 'Grace';

    expect(store.get('user.name')).toBe('Ada');
  });

  it('notifies watchers with new and previous values', () => {
    const store = new InMemoryStore({
      defaults: {
        count: 1,
      },
    });
    const listener = vi.fn();

    const unwatch = store.watch('count', listener);
    store.set('count', 2);
    unwatch();
    store.set('count', 3);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(2, 1);
  });
});
