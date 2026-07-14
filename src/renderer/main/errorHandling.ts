import { toLogFormat } from '@/common/errors.js';

interface VuePublicInstanceLike {
  $options?: {
    name?: string;
  };
  type?: Record<string, unknown>;
}

export interface FriendlyErrorState {
  title: string;
  message: string;
  detail: string;
}

const DEFAULT_FRIENDLY_ERROR = Object.freeze({
  title: 'Something went wrong',
  message:
    'The page ran into an unexpected problem. Try refreshing this window. If the issue keeps happening, please contact support.',
});

export function getComponentName(instance: unknown): string {
  if (!instance || typeof instance !== 'object') {
    return 'anonymous';
  }

  const publicInstance = instance as VuePublicInstanceLike;
  const type = publicInstance.type;

  return (
    publicInstance.$options?.name ||
    (typeof type?.name === 'string' && type.name) ||
    (typeof type?.__name === 'string' && type.__name) ||
    (typeof type?.displayName === 'string' && type.displayName) ||
    'anonymous'
  );
}

interface BuildVueErrorLogMessageOptions {
  error: unknown;
  info?: string;
  instance?: unknown;
  source?: string;
}

export function buildVueErrorLogMessage({
  error,
  info,
  instance,
  source = 'vue',
}: BuildVueErrorLogMessageOptions): string {
  const lines = [
    `[renderer][${source}] ${toLogFormat(error)}`,
    `Info: ${info || 'unknown'}`,
    `Component: ${getComponentName(instance)}`,
  ];

  return lines.join('\n');
}

export function createFriendlyErrorState(error: unknown): FriendlyErrorState {
  const detail = toLogFormat(error);

  return {
    ...DEFAULT_FRIENDLY_ERROR,
    detail:
      detail === '[object Object]' || detail === 'undefined' || detail === 'null' ? '' : detail,
  };
}
