import { app } from "electron";

import { IPC_EVENT_CHANNEL_NAME } from "@/common/constants.js";
import { registerBeforeQuitTask } from "./beforeQuitTasks.js";
import { sendToAllWindows } from "./windowManager/index.js";
import { events as debugEvents } from "./debug/index.js";
import { events as remoteStoreEvents } from "./store/index.js";

const appEvents = {
  onAppActivate(cb) {
    function listener(_, ...args) {
      cb(...args);
    }
    app.on("activate", listener);
    return () => { app.removeListener("activate", listener) }
  }
}

/**
 * @typedef {{
*   (cb: (...args: any[]) => void): () => void;
*   sendEvent?: (...args: any[]) => void;
* }} EventRegister
* @description 事件注册函数，可以通过 sendEvent 属性自定义如何发送事件。
*/


/**
 * @type {Record<string, Record<string, EventRegister>>}
 */
const allEvents = {
  // [namespace] : {}
  appEvents,
  debug: debugEvents,
  remoteStore: remoteStoreEvents
}

export function registerRemoteEvents() {
  Object.entries(allEvents).forEach(([namespace, eventRegisters]) => {
    Object.entries(eventRegisters).forEach(([eventName, register]) => {
      const channel = `${namespace}::${eventName}`;
      const unregister = register((...args) => {
        if (typeof register.sendEvent === "function") {
          register.sendEvent([IPC_EVENT_CHANNEL_NAME, channel, ...args]);
        } else {
          sendToAllWindows([IPC_EVENT_CHANNEL_NAME, channel, ...args]);
        }
      });

      registerBeforeQuitTask(unregister);
    });
  });
}

/**
 * 用于将主进程的 Remote Events 暴露给窗口
 * @returns {[string, string[]][]}
 */
export function getMainProcessEventMap() {
  return Object.entries(allEvents).map(([namespace, eventObject]) => {
    return [namespace, Object.keys(eventObject)];
  });
}