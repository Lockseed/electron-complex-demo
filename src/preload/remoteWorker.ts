import { ipcRenderer } from 'electron';
import { EventEmitter } from 'node:events';
import { AsyncCall } from 'async-call-rpc';

import type { RemoteAPIMap, RemoteEventMap } from '@/common/remote-contracts.js';
import { WORKER_NEW_CONNECTION_CHANNEL_NAME } from '@/common/constants.js';
import { parseProcessArgv, createRemoteAPI, createRemoteEvent } from './utils.js';

const whenRendererPortReady = new Promise<MessagePort>((resolve) => {
  ipcRenderer.once(WORKER_NEW_CONNECTION_CHANNEL_NAME, (event) => {
    resolve(event.ports[0]);
    console.log('[remoteWorker] RPC renderer side port ready.');
  });
});

function createRpcChannel(
  rendererPort: MessagePort
): import('async-call-rpc').EventBasedChannel<unknown> {
  return {
    on(listener) {
      rendererPort.onmessage = (event) => listener(event.data);
      return () => {
        rendererPort.onmessage = null;
      };
    },
    send(data) {
      rendererPort.postMessage(data);
    },
  };
}

export function genWorkerProcessApiAndEvent() {
  console.log('[genWorkerProcessApiAndEvent] Generating worker process API and Event...');

  const apiMap = parseProcessArgv<RemoteAPIMap>('--worker-process-api-map');
  console.log('[genWorkerProcessApiAndEvent] API map: ', apiMap);

  const eventMap = parseProcessArgv<RemoteEventMap>('--worker-process-event-map');
  console.log('[genWorkerProcessApiAndEvent] Event map: ', eventMap);

  const eventEmitter = new EventEmitter();

  const rendererToWokerAsyncCalls = {
    postEvent: (channel: string, ...args: unknown[]) => {
      if (!channel || typeof channel !== 'string') {
        console.error('[genWorkerProcessApiAndEvent] Invalid channel name: ', channel);
        return;
      }

      const [namespace, eventName] = channel.split('::');
      if (!namespace || !eventName) {
        console.error('[genWorkerProcessApiAndEvent] Invalid channel name: ', channel);
        return;
      }

      console.log('[genWorkerProcessApiAndEvent] Event will emit: ', channel, args);
      eventEmitter.emit(channel, ...args);
    },
  };

  const rpc = AsyncCall(rendererToWokerAsyncCalls, {
    channel: whenRendererPortReady
      .then((rendererPort) => {
        rendererPort.start();
        return rendererPort;
      })
      .then(createRpcChannel),
  });

  const rpcMethods = rpc as Record<string, (...args: unknown[]) => Promise<unknown>>;
  const apis = createRemoteAPI(apiMap, (channel, ...args) => rpcMethods[channel](...args), {
    tag: 'worker',
  });
  console.log('[genWorkerProcessApiAndEvent] Worker process APIs generated: ', apis);

  const events = createRemoteEvent(eventMap, (channel) => {
    return (listener) => {
      eventEmitter.addListener(channel, listener);
      console.log('[genWorkerProcessApiAndEvent] Event listener registered: ', channel);
      return function unregister() {
        eventEmitter.removeListener(channel, listener);
        console.log('[genWorkerProcessApiAndEvent] Event listener unregistered: ', channel);
      };
    };
  });
  console.log('[genWorkerProcessApiAndEvent] Main process events generated: ', events);

  return { apis, events };
}
