import type { _AsyncVersionOf } from 'async-call-rpc';

import type {
  RemoteAPIMap,
  RemoteAPIs,
  RemoteEventMap,
  RemoteEvents,
  RemoteStores,
} from './remote-contracts.js';

export type { RemoteAPIMap, RemoteAPIs, RemoteEventMap, RemoteEvents, RemoteStores };

export type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};

export type RpcServer<T> = _AsyncVersionOf<T>;

export interface RpcMainToWorkerAsyncCalls {
  getPath(name: Parameters<Electron.App['getPath']>[0]): string;
}

export interface RpcWorkerToMainAsyncCalls {
  getWorkerProcessAPIMap(): RemoteAPIMap;
  getWorkerProcessEventMap(): RemoteEventMap;
}

export interface RpcRendererToWorkerAsyncCalls {
  postEvent(channel: string, ...args: unknown[]): void;
}

export type RpcWorkerToRendererAsyncCalls = Record<
  string,
  (...args: unknown[]) => Promise<unknown>
>;

export type RpcServerMainToWorker = RpcServer<RpcMainToWorkerAsyncCalls>;
export type RpcServerWorkerToMain = RpcServer<RpcWorkerToMainAsyncCalls>;
export type RpcServerRendererToWorker = RpcServer<RpcRendererToWorkerAsyncCalls>;
export type RpcServerWorkerToRenderer = RpcServer<RpcWorkerToRendererAsyncCalls>;

export interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export interface EventRegister {
  (cb: (...args: unknown[]) => void): () => void;
  sendEvent?: (args: unknown[]) => void;
}
