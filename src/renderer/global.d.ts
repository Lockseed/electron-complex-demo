import type { RemoteAPIs, RemoteEvents, RemoteStores } from '../common/remote-contracts.js';

declare global {
  interface Window {
    __remoteAPIs: RemoteAPIs;
    __remoteEvents: RemoteEvents;
    __remoteStores: RemoteStores;
  }
}

export {};
