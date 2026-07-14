import { describe, expect, it } from 'vitest';

import {
  buildVueErrorLogMessage,
  createFriendlyErrorState,
  getComponentName,
} from './errorHandling.js';

describe('renderer error handling helpers', () => {
  it('extracts the best available component name', () => {
    expect(getComponentName({ $options: { name: 'RouteView' } })).toBe('RouteView');
    expect(getComponentName({ type: { __name: 'ScriptSetupView' } })).toBe('ScriptSetupView');
    expect(getComponentName(null)).toBe('anonymous');
  });

  it('builds a readable log message for Vue errors', () => {
    const message = buildVueErrorLogMessage({
      error: new Error('boom'),
      info: 'render function',
      instance: { $options: { name: 'EventListView' } },
      source: 'app.config.errorHandler',
    });

    expect(message).toContain('[renderer][app.config.errorHandler] Error: boom');
    expect(message).toContain('Info: render function');
    expect(message).toContain('Component: EventListView');
  });

  it('creates a friendly fallback state', () => {
    const state = createFriendlyErrorState(new Error('Request failed'));

    expect(state.title).toBe('Something went wrong');
    expect(state.message).toContain('Try refreshing this window');
    expect(state.detail).toContain('Error: Request failed');
  });
});
