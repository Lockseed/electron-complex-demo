import { logger } from './logger.js';

/**
 * @type {Record<string, Record<string, (...args: any[]) => () => void>>}
 */
const allWorkerEvents = {};

/**
 *
 * @param {import("../common/types.js").RpcServerRendererToWorker} rpc
 */
export function registerWorkerEvents(rpc) {
  Object.entries(allWorkerEvents).forEach(([namespace, eventRegisterMap]) => {
    Object.entries(eventRegisterMap).forEach(([eventName, eventRegister]) => {
      const unregister = eventRegister((...args) => {
        const channel = `${namespace}::${eventName}`;
        rpc.postEvent(channel, ...args);
        logger.debug(`[registerWithLog] Post event ${channel}`);
      });
      process.on('exit', () => {
        unregister();
      });
    });
  });
}

/**
 * 用于将 worker 进程的 remote API 暴露给主进程，再由主进程暴露给窗口
 * @returns {[string, string[]][]}
 */
export function getWorkerProcessEventMap() {
  return Object.entries(allWorkerEvents).map(([namespace, eventRegisterMap]) => {
    return [namespace, Object.keys(eventRegisterMap)];
  });
}
