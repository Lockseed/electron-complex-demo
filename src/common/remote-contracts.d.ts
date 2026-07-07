export type Unsubscribe = () => void;
export type JsonRecord = Record<string, unknown>;
export type RemoteAPIMap = [namespace: string, handlerNames: string[]][];
export type RemoteEventMap = [namespace: string, eventNames: string[]][];

export type RemoteEventSubscription<Args extends unknown[] = unknown[]> = (
  listener: (...args: Args) => void
) => Unsubscribe;

export interface RemoteStoreProxy {
  get<T = unknown>(key: string, defaultValue?: T): T;
  set(keyOrObj: string | JsonRecord, value?: unknown): void;
  delete(key: string): void;
  clear(): void;
  watch<T = unknown>(key: string, callback: (newValue: T, oldValue: T) => void): Unsubscribe;
  all(): JsonRecord;
}

export interface MainRemoteAPIs {
  calculator: {
    add(a: number, b: number): Promise<number>;
  };
  remoteStore: {
    getGlobalStoreState(): Promise<JsonRecord>;
    setGlobalStore(keyOrObj: string | JsonRecord, value?: unknown): Promise<void>;
    deleteGlobalStore(key: string): Promise<void>;
    clearGlobalStore(): Promise<void>;
  };
}

export interface WorkerRemoteAPIs {
  fileService: {
    calculateChecksum(filePath: string, algorithm?: string): Promise<string>;
  };
}

export type RemoteAPIs = MainRemoteAPIs & WorkerRemoteAPIs;

export interface MainRemoteEvents {
  appEvents: {
    onAppActivate: RemoteEventSubscription<[hasVisibleWindows: boolean]>;
  };
  debug: {
    onTriggerRendererProcessGone: RemoteEventSubscription<[reason: 'crash' | 'oom']>;
  };
  remoteStore: {
    onGlobalStoreChanged: RemoteEventSubscription<[newState: JsonRecord, oldState?: JsonRecord]>;
  };
}

export type WorkerRemoteEvents = Record<string, never>;
export type RemoteEvents = MainRemoteEvents & WorkerRemoteEvents;

export interface RemoteStores {
  globalStore: RemoteStoreProxy;
}
