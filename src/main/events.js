import { app } from "electron";

import { IPC_EVENT_CHANNEL_NAME } from "@/common/constants";
import registerBeforeQuitTask from "./beforeQuitTasks.js";
import { sendToAllWindows } from "./windowManager";

const appEvents = {
  onAppActivate(cb) {
    function listener(_, ...args) {
      cb(...args);
    }
    app.on("activate", listener);
    return () => { app.removeListener("activate", listener) }
  }
}

const allEvents = {
  // [namespace] : {}
  appEvents,
}

export function registerRemoteEvents() {
  Object.entries(allEvents).forEach(([namespace, eventRegisters]) => {
    Object.entries(eventRegisters).forEach(([eventName, register]) => {
      const channel = `${namespace}::${eventName}`;
      const unregister = register((...args) => {
        sendToAllWindows([IPC_EVENT_CHANNEL_NAME, channel, ...args]);
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