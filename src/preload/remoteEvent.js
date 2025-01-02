import { EventEmitter } from "node:events";
import { ipcRenderer } from "electron";

import { IPC_EVENT_CHANNEL_NAME } from "@/common/constants.js";
import { isPlainObject } from "@/common/utils";

function genMainProcessEvents() {
  console.log("[genMainProcessEvents] Generating main process events...");
  const eventMap = {
    // namespaceA: [eventA1, eventA2, ...]
    // namespaceB: [eventB1, eventB2, ...]
    appEvents: ['onAppActivate'],
  };

  console.log("[genMainProcessEvents] Event map: ", eventMap);
  // check map
  if (!isPlainObject(eventMap)) {
    console.error("[genMainProcessEvents] Invalid eventMap.");
    return {};
  }

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

  // 生成事件注册函数
  const eventEntries = Object.entries(eventMap);
  const namespaceEventRegisterMapPairs = eventEntries.map(([namespace, eventNames]) => {
    // [event1, event2, ...] => [[event1, registerFunction1], [event2, registerFunction2], ...]
    const eventRegisterPair = eventNames.map((eventName) => {
      const channel = `${namespace}::${eventName}`;
      /** @type {(listener: (...args: any[]) => void) => () => void} */
      const register = (listener) => {
        eventEmitter.addListener(channel, listener);
        console.log("[genMainProcessEvents] Event listener registered: ", channel);
        return function unregister() {
          eventEmitter.removeListener(channel, listener);
          console.log("[genMainProcessEvents] Event listener unregistered: ", channel);
        }
      };

      return [eventName, register]
    });
    // { eventName1: registerFunction1, eventName2: registerFunction2, ...}
    const eventRegisterMap = Object.fromEntries(eventRegisterPair);
    // [namespaces, {eventName1: registerFunction1, eventName2: registerFunction2, ...}]
    return [namespace, eventRegisterMap];
  });

  const events = Object.fromEntries(namespaceEventRegisterMapPairs);
  console.log("[genMainProcessEvents] Main process events generated: ", events);

  return events;
}

export function genRemoteEvents() {
  return {
    ...genMainProcessEvents(),
  }
}