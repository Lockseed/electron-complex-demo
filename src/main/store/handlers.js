import { whenGlobalStoreReady } from './global.js';

export default {
  async getGlobalStoreState() {
    const store = await whenGlobalStoreReady;
    // console.log("[getGlobalStoreState]", store.store);
    return store.store;
  },
  async setGlobalStore(keyOrObj, value) {
    const store = await whenGlobalStoreReady;
    store.set(keyOrObj, value);
  },
  async deleteGlobalStore(key) {
    const store = await whenGlobalStoreReady;
    store.delete(key);
  },
  async clearGlobalStore() {
    const store = await whenGlobalStoreReady;
    store.clear();
  },
};
