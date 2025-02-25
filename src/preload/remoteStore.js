import { ipcRenderer } from "electron";
import { IPC_API_CHANNEL_NAME } from "@/common/constants.js";
import InMemoryStore from "@/common/InMemoryStore.js";

const initialGlobalStoreState = ipcRenderer.sendSync(IPC_API_CHANNEL_NAME, "remoteStore::getGlobalStoreState");

function sendToMain(action, ...args) {
  ipcRenderer.invoke(IPC_API_CHANNEL_NAME, action, ...args);
}

/**
 * 
 * @param {Object} options 
 * @param {Object} [options.initialState]
 * @param {string} options.onChangeEvent
 * @param {string} options.setEvent
 * @param {string} options.deleteEvent
 * @param {string} options.clearEvent
 * @returns 
 */
function createRemoteStoreProxy(options) {
  const store = new InMemoryStore({
    defaults: options?.initialState || {},
  });

  const { onChangeEvent, setEvent, deleteEvent, clearEvent } = options;

  ipcRenderer.on(IPC_API_CHANNEL_NAME, (_, channel, newState) => {
    if (channel === `remoteStore::${onChangeEvent}`) {
      console.log(`remoteStore::${onChangeEvent}`, newState);
    }
  });

  return {
    get(key, defaultValue) {
      return store.get(key, defaultValue);
    },
    set(keyOrObj, value) {
      store.set(keyOrObj, value);
      sendToMain(`remoteStore::${setEvent}`, keyOrObj, value);
    },
    delete(key) {
      store.delete(key);
      sendToMain(`remoteStore::${deleteEvent}`, key);
    },
    clear() {
      store.clear();
      sendToMain(`remoteStore::${clearEvent}`);
    },
    watch(key, cb) {
      const unwatch = store.watch(key, cb);
      return unwatch;
    },
    all() {
      return store.store;
    }
  }
}

const globalStore = createRemoteStoreProxy({
  initialState: initialGlobalStoreState,
  onChangeEvent: "onGlobalStoreChanged",
  setEvent: "setGlobalStore",
  deleteEvent: "deleteGlobalStore",
  clearEvent: "clearGlobalStore",
});

export {
  globalStore
}