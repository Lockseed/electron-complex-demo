declare module 'lodash-es' {
  export function cloneDeep<T>(value: T): T;
  export function debounce<T extends (...args: any[]) => any>(fn: T, wait?: number): T;
  export function isEqual(value: unknown, other: unknown): boolean;
}

declare module 'electron-squirrel-startup' {
  const started: boolean;
  export default started;
}
