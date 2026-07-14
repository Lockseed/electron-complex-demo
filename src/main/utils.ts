export const isMacOS = process.platform === 'darwin';
export const isWindows = process.platform === 'win32';

export function tryParseUrl(value: unknown): URL | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  try {
    return new URL(value);
  } catch (_) {
    return undefined;
  }
}
