// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from 'electron';
import 'electron-log/preload.js';

import { genMainProcessAPIs, genMainProcessEvents } from './remoteMain.js';
import { genWorkerProcessApiAndEvent } from './remoteWorker.js';
import * as remoteStores from './remoteStore.js';

import * as debug from './debug.js';
import type { RemoteAPIs, RemoteEvents } from '@/common/remote-contracts.js';

const mainAPIs = genMainProcessAPIs();
const mainEvents = genMainProcessEvents();
const { apis: workerAPIs, events: workerEvents } = genWorkerProcessApiAndEvent();

/** @type {import("../common/remote-contracts.js").RemoteAPIs} */
const remoteAPIs = {
  ...mainAPIs,
  ...workerAPIs,
} as unknown as RemoteAPIs;

const remoteEvents = {
  ...mainEvents,
  ...workerEvents,
} as unknown as RemoteEvents;

contextBridge.exposeInMainWorld('__remoteAPIs', remoteAPIs);
contextBridge.exposeInMainWorld('__remoteEvents', remoteEvents);
contextBridge.exposeInMainWorld('__remoteStores', remoteStores);

debug.setup({
  remoteAPIs,
  remoteEvents,
});
