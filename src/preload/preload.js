// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";
import "electron-log/preload.js";

import { genRemoteAPIs } from "./remoteAPI";
import { genRemoteEvents } from "./remoteEvent";

const remoteAPIs = genRemoteAPIs();
const remoteEvents = genRemoteEvents();

contextBridge.exposeInMainWorld("__remoteAPIs", remoteAPIs);
contextBridge.exposeInMainWorld("__remoteEvents", remoteEvents);
