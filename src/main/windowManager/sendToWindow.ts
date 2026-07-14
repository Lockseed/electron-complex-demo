import { BrowserWindow, WebContentsView } from 'electron';

import logger from '../logger.js';
import * as helpers from './windowHelpers.js';

interface SendToWindowOptions {
  broadcastToContentview?: boolean;
}

/**
 * 将 IPC 消息广播到指定窗口的所有 contentView
 */
export function broadcastToWindowContentViews(
  win: BrowserWindow,
  sendArgs: unknown[] = [],
  _options: SendToWindowOptions = {}
): void {
  if (!win || !(win instanceof BrowserWindow)) {
    throw new TypeError(
      "[broadcastToWindowContentViews] Invalid 'win'. Expected BrowserWindow, got " + typeof win
    );
  }

  const [channel, ...args] = sendArgs;

  // channel 不允许为空
  if (!channel || typeof channel !== 'string') {
    throw new TypeError(
      "[broadcastToWindowContentViews] Invalid 'channel'. Expected non-empty string, got " +
        typeof channel
    );
  }

  // 有 BrowserWindow 对象不代表 webContents 一定存在
  if (win.isDestroyed() || !win.webContents) {
    logger.warn(`[broadcastToWindowContentViews] Target window(id:${win.id}) is destroyed.`);
    return;
  }

  win.contentView?.children?.forEach((view) => {
    if (view instanceof WebContentsView && view.webContents && !view.webContents.isDestroyed()) {
      helpers.waitTileCanExecuteJavascript(view.webContents).then(() => {
        logger.debug(
          `[broadcastToWindowContentViews] Broadcasting IPC message to contentView(id:${view.webContents.id}) with channel: ${channel}`
        );
        view.webContents.send(channel, ...args);
      });
    }
  });
}

export function sendToWindow(
  win: BrowserWindow,
  sendArgs: unknown[] = [],
  options: SendToWindowOptions = { broadcastToContentview: false }
): void {
  if (!win || !(win instanceof BrowserWindow)) {
    throw new TypeError("[sendToWindow] Invalid 'win'. Expected BrowserWindow, got " + typeof win);
  }

  const [channel, ...args] = sendArgs;

  // channel 不允许为空
  if (!channel || typeof channel !== 'string') {
    throw new TypeError(
      "[sendToWindow] Invalid 'channel'. Expected non-empty string, got " + typeof channel
    );
  }

  // 有 BrowserWindow 对象不代表 webContents 一定存在
  if (win.isDestroyed() || !win.webContents) {
    logger.warn(`[sendToWindow] Target window(id:${win.id}) is destroyed.`);
    return;
  }

  helpers.waitTileCanExecuteJavascript(win.webContents).then(() => {
    logger.debug(
      `[sendToWindow] Sending IPC message to window(id:${win.id}) with channel: ${channel}`
    );
    win.webContents.send(channel, ...args);

    if (options.broadcastToContentview) {
      broadcastToWindowContentViews(win, sendArgs);
    }
  });
}

export function sendToAllWindows(sendArgs: unknown[], options: SendToWindowOptions = {}): void {
  logger.debug(`[sendToAllWindows] Channel: ${sendArgs[0]}`);
  BrowserWindow.getAllWindows().forEach((win) => {
    sendToWindow(win, sendArgs, options);
  });
}
