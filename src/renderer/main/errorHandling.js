import { toLogFormat } from '@/common/errors.js';

const DEFAULT_FRIENDLY_ERROR = Object.freeze({
  title: 'Something went wrong',
  message:
    'The page ran into an unexpected problem. Try refreshing this window. If the issue keeps happening, please contact support.',
});

/**
 * @param {unknown} instance
 * @returns {string}
 */
export function getComponentName(instance) {
  if (!instance || typeof instance !== 'object') {
    return 'anonymous';
  }

  const publicInstance =
    /** @type {{ $options?: { name?: string }, type?: Record<string, unknown> }} */ (instance);
  const type = publicInstance.type;

  return (
    publicInstance.$options?.name ||
    (typeof type?.name === 'string' && type.name) ||
    (typeof type?.__name === 'string' && type.__name) ||
    (typeof type?.displayName === 'string' && type.displayName) ||
    'anonymous'
  );
}

/**
 * @param {object} options
 * @param {unknown} options.error
 * @param {string} [options.info]
 * @param {unknown} [options.instance]
 * @param {string} [options.source]
 * @returns {string}
 */
export function buildVueErrorLogMessage({ error, info, instance, source = 'vue' }) {
  const lines = [
    `[renderer][${source}] ${toLogFormat(error)}`,
    `Info: ${info || 'unknown'}`,
    `Component: ${getComponentName(instance)}`,
  ];

  return lines.join('\n');
}

/**
 * @param {unknown} error
 * @returns {{ title: string, message: string, detail: string }}
 */
export function createFriendlyErrorState(error) {
  const detail = toLogFormat(error);

  return {
    ...DEFAULT_FRIENDLY_ERROR,
    detail:
      detail === '[object Object]' || detail === 'undefined' || detail === 'null' ? '' : detail,
  };
}
