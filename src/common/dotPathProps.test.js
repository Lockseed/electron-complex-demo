import { describe, expect, it } from 'vitest';

import { deleteProperty, getProperty, hasProperty, setProperty } from './dotPathProps.js';

describe('dotPathProps', () => {
  it('gets nested values with dot and bracket paths', () => {
    const state = {
      user: {
        name: 'Ada',
        projects: [{ id: 'alpha' }],
      },
    };

    expect(getProperty(state, 'user.name')).toBe('Ada');
    expect(getProperty(state, 'user.projects[0].id')).toBe('alpha');
    expect(getProperty(state, 'user.missing', 'fallback')).toBe('fallback');
  });

  it('sets nested values and creates objects or arrays as needed', () => {
    const state = {};

    setProperty(state, 'user.profile.name', 'Ada');
    setProperty(state, 'user.projects[0].id', 'alpha');

    expect(state).toEqual({
      user: {
        profile: { name: 'Ada' },
        projects: [{ id: 'alpha' }],
      },
    });
  });

  it('checks and deletes nested values', () => {
    const state = {
      user: {
        profile: {
          name: 'Ada',
        },
      },
    };

    expect(hasProperty(state, 'user.profile.name')).toBe(true);
    expect(hasProperty(state, 'user.profile.age')).toBe(false);
    expect(deleteProperty(state, 'user.profile.name')).toBe(true);
    expect(hasProperty(state, 'user.profile.name')).toBe(false);
    expect(deleteProperty(state, 'user.unknown.name')).toBe(false);
  });
});
