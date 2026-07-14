import { whenGlobalStoreReady } from './global.js';
import type { JsonRecord } from '@/common/remote-contracts.js';

export default {
  async getGlobalStoreState(): Promise<JsonRecord> {
    const store = await whenGlobalStoreReady;
    return store.store as JsonRecord;
  },
  async setGlobalStore(keyOrObj: string | JsonRecord, value?: unknown): Promise<void> {
    const store = await whenGlobalStoreReady;
    (store.set as (keyOrObj: string | JsonRecord, value?: unknown) => void)(keyOrObj, value);
  },
  async deleteGlobalStore(key: string): Promise<void> {
    const store = await whenGlobalStoreReady;
    store.delete(key);
  },
  async clearGlobalStore(): Promise<void> {
    const store = await whenGlobalStoreReady;
    store.clear();
  },
};
