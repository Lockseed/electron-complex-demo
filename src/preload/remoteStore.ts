import { ipcRenderer } from 'electron';
import { IPC_API_CHANNEL_NAME } from '@/common/constants.js';
import InMemoryStore from '@/common/InMemoryStore.js';
import type { JsonRecord, RemoteStoreProxy } from '@/common/remote-contracts.js';

const initialGlobalStoreState = ipcRenderer.sendSync(
  IPC_API_CHANNEL_NAME,
  'remoteStore::getGlobalStoreState'
);

function sendToMain(action: string, ...args: unknown[]): Promise<unknown> {
  return ipcRenderer.invoke(IPC_API_CHANNEL_NAME, action, ...args);
}

interface RemoteStoreProxyOptions {
  initialState?: JsonRecord;
  onChangeEvent: string;
  setEvent: string;
  deleteEvent: string;
  clearEvent: string;
}

function createRemoteStoreProxy(options: RemoteStoreProxyOptions): RemoteStoreProxy {
  const store = new InMemoryStore({
    defaults: options?.initialState || {},
  });

  const { onChangeEvent, setEvent, deleteEvent, clearEvent } = options;

  ipcRenderer.on(IPC_API_CHANNEL_NAME, (_, channel, newState) => {
    if (channel === `remoteStore::${onChangeEvent}`) {
      console.log(`remoteStore::${onChangeEvent}`, newState);
    }
  });

  const proxy: RemoteStoreProxy = {
    get<T = unknown>(key: string, defaultValue?: T): T {
      return store.get(key, defaultValue) as T;
    },
    set(keyOrObj: string | JsonRecord, value?: unknown): void {
      store.set(keyOrObj, value);
      void sendToMain(`remoteStore::${setEvent}`, keyOrObj, value);
    },
    delete(key: string): void {
      store.delete(key);
      void sendToMain(`remoteStore::${deleteEvent}`, key);
    },
    clear(): void {
      store.clear();
      void sendToMain(`remoteStore::${clearEvent}`);
    },
    watch<T = unknown>(key: string, cb: (newValue: T, oldValue: T) => void): () => void {
      const unwatch = store.watch(key, (newValue, oldValue) => cb(newValue as T, oldValue as T));
      return unwatch;
    },
    all(): JsonRecord {
      return store.store;
    },
  };

  return proxy;
}

const globalStore = createRemoteStoreProxy({
  initialState: initialGlobalStoreState,
  onChangeEvent: 'onGlobalStoreChanged',
  setEvent: 'setGlobalStore',
  deleteEvent: 'deleteGlobalStore',
  clearEvent: 'clearGlobalStore',
});

export { globalStore };
