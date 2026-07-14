import { logger } from './logger.js';

import type { RpcServerRendererToWorker } from '@/common/types.js';

type WorkerEventRegister = (...args: unknown[]) => () => void;

const allWorkerEvents: Record<string, Record<string, WorkerEventRegister>> = {};

/**
 *
 */
export function registerWorkerEvents(rpc: RpcServerRendererToWorker): void {
  Object.entries(allWorkerEvents).forEach(([namespace, eventRegisterMap]) => {
    Object.entries(eventRegisterMap).forEach(([eventName, eventRegister]) => {
      const unregister = eventRegister((...args: unknown[]) => {
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
export function getWorkerProcessEventMap(): [string, string[]][] {
  return Object.entries(allWorkerEvents).map(([namespace, eventRegisterMap]) => {
    return [namespace, Object.keys(eventRegisterMap)];
  });
}
