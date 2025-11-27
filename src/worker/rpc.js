import { AsyncCall } from 'async-call-rpc';
import { getWorkerProcessAPIMap } from './handlers.js';
import { getWorkerProcessEventMap } from './events.js';
import { logger } from './logger.js';

const workerProcessSideImplementation = {
  getWorkerProcessAPIMap,
  getWorkerProcessEventMap,
};

export const rpc = AsyncCall(workerProcessSideImplementation, {
  channel: {
    on(cb) {
      const lisener = (event) => {
        cb(event.data);
      };
      process.parentPort.on('message', lisener);
      return () => {
        process.parentPort.off('message', lisener);
      };
    },
    send(data) {
      process.parentPort.postMessage(data);
    },
  },
});

logger.info('main-worker rpc, worker side created.');
