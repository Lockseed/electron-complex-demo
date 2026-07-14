import { EventEmitter } from 'node:events';
import { BrowserWindow } from 'electron';

import type { EventRegister } from '@/common/types.js';
import { sendToWindow } from '../windowManager/index.js';

type DebugEventName = 'renderer-process-gone';

const eventBus = new EventEmitter();

function _listen(eventName: DebugEventName, listener: (...args: unknown[]) => void): () => void {
  eventBus.on(eventName, listener);
  return () => {
    eventBus.removeListener(eventName, listener);
  };
}

function _trigger(eventName: DebugEventName, ...args: unknown[]): void {
  eventBus.emit(eventName, ...args);
}

export function triggerRendererProcessGone(reason: 'crash' | 'oom'): void {
  _trigger('renderer-process-gone', reason);
}

/* ------------------ Events ---------------------- */

function _sendIPCEvent(args: unknown[]): void {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    sendToWindow(win, args);
  }
}

type DebugEvents = {
  onTriggerRendererProcessGone: EventRegister;
};

export const events: DebugEvents = {
  onTriggerRendererProcessGone(cb) {
    return _listen('renderer-process-gone', function listener(...args) {
      cb(...args);
    });
  },
};

events.onTriggerRendererProcessGone.sendEvent = _sendIPCEvent;
