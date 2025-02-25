
export const isMacOS = process.platform === "darwin";
export const isWindows = process.platform === "win32";

/**
 * 
 * @param {string} value 
 * @returns {URL | undefined}
 */
export function tryParseUrl(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  try {
    return new URL(value);
  } catch (_) {
    return undefined;
  }
}
