import { whenGlobalStoreReady } from "./global.js"

export default {
  /**
   * 
   * @param {(...args: any[]) => void} cb 
   * @returns {() => void}
   */
  onGlobalStoreChanged(cb) {
    let unsubscribe;
    whenGlobalStoreReady.then(store => {
      unsubscribe = store.onDidAnyChange(cb);
    });
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    }
  }
}