
/**
 * @typedef {{
 *   description: string,
 *   (someArg: number): boolean
 * }} DescribableFunction
 */

/**
 * @template T
 * @typedef {import("async-call-rpc")._AsyncVersionOf<T>} RpcServer
 */

/**
 * @typedef {Object} RpcMainToWorkerAsyncCalls
 * @property {(name: string) => string} getPath
 */

/**
 * @typedef {Object} RpcWorkerToMainAsyncCalls
 * @property {() => [string, string[]][]} getWorkerProcessAPIMap
 * @property {() => [string, string[]][]} getWorkerProcessEventMap
 */

/**
 * @typedef {Object} RpcRendererToWorkerAsyncCalls
 * @property {(channel: string, ...args: any[]) => void} postEvent
 */

/**
 * @typedef {Record<string, (...args: any[]) => Promise<any>>} RpcWorkerToRendererAsyncCalls
 */

/**
 * @typedef {RpcServer<RpcMainToWorkerAsyncCalls>} RpcServerMainToWorker
 */

/**
 * @typedef {RpcServer<RpcWorkerToMainAsyncCalls>} RpcServerWorkerToMain
 */

/**
 * @typedef {RpcServer<RpcRendererToWorkerAsyncCalls>} RpcServerRendererToWorker
 */

/**
 * @typedef {RpcServer<RpcWorkerToRendererAsyncCalls>} RpcServerWorkerToRenderer
 */