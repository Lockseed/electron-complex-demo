import { anyToString } from './utils.js';

export function toLogFormat(err) {
  if (err instanceof Error && err.stack) {
    return err.stack || err.message;
  }

  if (err && typeof err === 'object') {
    if ('message' in err) {
      const prefix = err.name ? `${err.name}: ` : '';
      return prefix + anyToString(err.message);
    } else if ('cause' in err) {
      return anyToString(err.cause);
    }
  }

  return anyToString(err);
}
