import { anyToString } from './utils.js';

export function toLogFormat(err: unknown): string {
  if (err instanceof Error && err.stack) {
    return err.stack || err.message;
  }

  if (err && typeof err === 'object') {
    const errorObject = err as { message?: unknown; name?: unknown; cause?: unknown };
    if ('message' in errorObject) {
      const prefix = typeof errorObject.name === 'string' ? `${errorObject.name}: ` : '';
      return prefix + anyToString(errorObject.message);
    } else if ('cause' in errorObject) {
      return anyToString(errorObject.cause);
    }
  }

  return anyToString(err);
}
