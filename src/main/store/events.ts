import { whenGlobalStoreReady } from './global.js';

export default {
  onGlobalStoreChanged(cb: (...args: unknown[]) => void): () => void {
    let unsubscribe: (() => void) | undefined;
    whenGlobalStoreReady.then((store) => {
      unsubscribe = store.onDidAnyChange(cb);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  },
};
