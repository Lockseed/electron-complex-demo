import { AsyncCall } from 'async-call-rpc';
import { logger } from './logger.js';
import * as fileService from './fileService/index.js';

/**
 * @type {Record<string, Record<string, (...args: any[]) => Promise<any>>>}
 */
export const allWorkerHandlers = {
  fileService,
};

/**
 * 创建沟通 worker <-> renderer 的 RPC通信
 * 允许 renderer 侧调用 worker 侧的 handler 方法
 * @param {Electron.MessagePortMain} workerPort
 * @returns {import("../common/types.js").RpcServerRendererToWorker}
 */
export function registerWorkerAPIs(workerPort) {
  // { fileService: { calculateChecksum: (...any) => Promise<string> } }
  // -> { fileService::calculateChecksum: (...any) => Promise<string> }
  const allHandlers = Object.entries(allWorkerHandlers).reduce((acc, [namespace, handlerObj]) => {
    Object.entries(handlerObj).forEach(([handlerName, handler]) => {
      const handlerWithLog = async (...args) => {
        try {
          const start = performance.now();
          const result = await handler(...args);
          const end = performance.now();
          logger.debug(
            `[handlerWithLog] Execute handler: ${namespace}::${handlerName} in ${(end - start).toFixed(2)}ms`
          );

          return result;
        } catch (error) {
          logger.error(
            `[handlerWithLog] Execution error in worker handler: ${namespace}::${handlerName}`,
            error
          );
        }
      };
      acc[`${namespace}::${handlerName}`] = handlerWithLog;
    });
    return acc;
  }, {});

  return AsyncCall(allHandlers, {
    channel: {
      on(listener) {
        /** @param {Electron.MessageEvent} event */
        const f = (event) => listener(event.data);
        workerPort.on('message', f);
        return () => {
          workerPort.off('message', f);
        };
      },
      send(data) {
        workerPort.postMessage(data);
      },
    },
  });
}

/**
 * 用于将 worker 进程的 remote API 暴露给主进程，再由主进程暴露给窗口
 * @returns {[string, string[]][]}
 */
export function getWorkerProcessAPIMap() {
  return Object.entries(allWorkerHandlers).map(([namespace, handlerObj]) => {
    return [namespace, Object.keys(handlerObj)];
  });
}
