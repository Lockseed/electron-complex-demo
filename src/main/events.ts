import { app } from 'electron';

import type { EventRegister } from '@/common/types.js';
import { IPC_EVENT_CHANNEL_NAME } from '@/common/constants.js';
import { registerBeforeQuitTask } from './beforeQuitTasks.js';
import { sendToAllWindows } from './windowManager/index.js';
import { events as debugEvents } from './debug/index.js';
import { events as remoteStoreEvents } from './store/index.js';

const appEvents: Record<string, EventRegister> = {
  onAppActivate(cb) {
    function listener(_event: Electron.Event, ...args: unknown[]) {
      cb(...args);
    }
    app.on('activate', listener);
    return () => {
      app.removeListener('activate', listener);
    };
  },
};

const allEvents: Record<string, Record<string, EventRegister>> = {
  // [namespace] : {}
  appEvents,
  debug: debugEvents,
  remoteStore: remoteStoreEvents,
};

export function registerRemoteEvents(): void {
  Object.entries(allEvents).forEach(([namespace, eventRegisters]) => {
    Object.entries(eventRegisters).forEach(([eventName, register]) => {
      const channel = `${namespace}::${eventName}`;
      const unregister = register((...args) => {
        if (typeof register.sendEvent === 'function') {
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
 */
export function getMainProcessEventMap(): [string, string[]][] {
  return Object.entries(allEvents).map(([namespace, eventObject]) => {
    return [namespace, Object.keys(eventObject)];
  });
}
