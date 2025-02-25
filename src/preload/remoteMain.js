import { ipcRenderer } from "electron";
import { EventEmitter } from "node:events";

import { IPC_API_CHANNEL_NAME, IPC_EVENT_CHANNEL_NAME } from "@/common/constants.js";
import { parseProcessArgv, createRemoteAPI, createRemoteEvent } from "./utils.js";

/**
 * 
 * @returns {Record<string, Record<string, (...args: any[]) => Promise<any>>> | {}}
 */
export function genMainProcessAPIs() {
  console.log("[genMainProcessAPIs] Generating main process APIs...");

  /** @type {[string, string[]][]|null} */
  const apiMap = parseProcessArgv("--main-process-api-map")

  console.log("[genMainProcessAPIs] API map: ", apiMap);

  // check map
  if (!apiMap || !Array.isArray(apiMap)) {
    console.warn("[genMainProcessAPIs] Invalid apiMap.");
    return {};
  }

  const apis = createRemoteAPI(
    apiMap, 
    (channel, ...args) => ipcRenderer.invoke(IPC_API_CHANNEL_NAME, channel, ...args), 
    { tag: "main" }
  );

  console.log("[genMainProcessAPIs] Main process APIs generated: ", apis);
  return apis;
}

export function genMainProcessEvents() {
  console.log("[genMainProcessEvents] Generating main process events...");

  /** @type {[string, string[]][]|null} */ 
  const eventMap = parseProcessArgv("--main-process-event-map");

  console.log("[genMainProcessEvents] Event map: ", eventMap);

  const eventEmitter = new EventEmitter();

  // 监听来自主进程的事件
  ipcRenderer.on(IPC_EVENT_CHANNEL_NAME, (_, channel, ...args) => {
    if (!channel || typeof channel !== "string") {
      console.error("[genMainProcessEvents] Invalid channel name: ", channel);
      return;
    }

    const [namespace, eventName] = channel.split("::");
    if (!namespace || !eventName) {
      console.error("[genMainProcessEvents] Invalid channel name: ", channel);
      return;
    }

    console.log("[genMainProcessEvents] Event will emit: ", channel, args);
    eventEmitter.emit(channel, ...args);
  });
  
  const events = createRemoteEvent(
    eventMap,
    (channel) => {
      return (listener) => {
        eventEmitter.addListener(channel, listener);
        console.log("[genMainProcessEvents] Event listener registered: ", channel);
        return function unregister() {
          eventEmitter.removeListener(channel, listener);
          console.log("[genMainProcessEvents] Event listener unregistered: ", channel);
        }
      }
    },
    { tag: "main" }
  )
  console.log("[genMainProcessEvents] Main process events generated: ", events);

  return events;
}
