// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";
import "electron-log/preload.js";

import { genRemoteAPIs } from "./remoteAPI.js";
import { genRemoteEvents } from "./remoteEvent.js";

const remoteAPIs = genRemoteAPIs();
const remoteEvents = genRemoteEvents();

contextBridge.exposeInMainWorld("__remoteAPIs", remoteAPIs);
contextBridge.exposeInMainWorld("__remoteEvents", remoteEvents);

remoteEvents.debugEvents?.onTriggerRendererProcessGone((reason) => {
  console.log("[onTriggerRendererProcessGone] reason ", reason);
  if (reason === "crash") {
    let count = 3;
    let timer = setInterval(() => {
      console.log("Renderer Crash After ", count);
      count--;
      if (count <= 0) {
        clearInterval(timer);
        process.crash();
      }
    }, 1000);
  }
});
