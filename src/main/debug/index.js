import { EventEmitter } from 'node:events';
import { BrowserWindow } from 'electron';

import { sendToWindow } from '../windowManager/index.js';

/**
 * @typedef {"renderer-process-gone"} DebugEventName
 */

const eventBus = new EventEmitter();

/**
 * 
 * @param {DebugEventName} eventName 
 * @param {(...args: any[]) => void} listener 
 * @returns {() => void}
 */
function _listen(eventName, listener) {
  eventBus.on(eventName, listener);
  return () => { eventBus.removeListener(eventName, listener) }
}

/**
 * 
 * @param {DebugEventName} eventName 
 * @param  {...any} args 
 */
function _trigger(eventName, ...args) {
  eventBus.emit(eventName, ...args);
}


/**
 * @param {"crash" | "oom"} reason
 */
export function triggerRendererProcessGone(reason) {
  _trigger("renderer-process-gone", reason);
}


/* ------------------ Events ---------------------- */

/**
 * @param {any[]} args
 */
function _sendIPCEvent(args) {
  const win = BrowserWindow.getFocusedWindow();
  sendToWindow(win, args);
}

/**
 * @typedef {import("../events.js").EventRegister} EventRegister
 */

/**
 * @type {Record<string, EventRegister>}
 */
export const events = {
  onTriggerRendererProcessGone(cb) {
    return _listen("renderer-process-gone", function listener(...args) {
      cb(...args);
    });
  }
}

events.onTriggerRendererProcessGone.sendEvent = _sendIPCEvent;