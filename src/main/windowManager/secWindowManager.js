import { EventEmitter } from 'node:events';
import path from 'node:path';
import { BrowserWindow } from 'electron';

import logger from '../logger.js';
import isDev from '../isDev.js';
import { appIsQuitting } from '../beforeQuitTasks.js';
import { isWindows, isMacOS } from '../utils.js';
import { showWindow, hideWindow } from './windowHelpers.js';

export const secondaryWindowEventBus = new EventEmitter();

let /** @type {Electron.BrowserWindow|undefined} */ secondaryWindow;
let /** @type {Promise<Electron.BrowserWindow>} */ secondaryWindowCreated;
let /** @type {(value:Electron.BrowserWindow) => void} */ resolveSecWindowCreate;

/**
 * 创建次要窗口 这个窗口主要用于测试
 * 强制创建，不判断是否已经创建或者正在创建
 * @returns {Electron.BrowserWindow}
 */
function createSecWindow() {
  logger.info('Creating secondary window...');

  const resolvers = Promise.withResolvers();
  secondaryWindowCreated = resolvers.promise;
  resolveSecWindowCreate = resolvers.resolve;

  // Create the browser window.
  secondaryWindow = new BrowserWindow({
    titleBarStyle: isMacOS ? 'hiddenInset' : isWindows ? 'hidden' : 'default',
    width: 400,
    height: 300,
    minWidth: 400,
    minHeight: 300,
    visualEffectState: 'active',
    vibrancy: 'under-window',
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      preload: path.join(import.meta.dirname, 'preload.cjs'),
    },
  });

  _bindEvents(secondaryWindow);

  // and load the index.html of the app.
  if (SECONDARY_WINDOW_VITE_DEV_SERVER_URL) {
    secondaryWindow.loadURL(SECONDARY_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    secondaryWindow.loadFile(
      path.join(import.meta.dirname, `../renderer/${SECONDARY_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  isDev && secondaryWindow.webContents.openDevTools();

  resolveSecWindowCreate(secondaryWindow);

  logger.info('Secondary window created.');
  return secondaryWindow;
}

/**
 * 确保次要窗口已经创建
 * @returns {Promise<Electron.BrowserWindow>}
 */
export async function ensureSecWindow() {
  let shouldCreate = false;

  if (!secondaryWindow && !secondaryWindowCreated) {
    // Case1: 没有创建次要窗口，也不是在创建过程中
    shouldCreate = true;
  } else if (secondaryWindow && secondaryWindow.isDestroyed()) {
    // Case2: 次要窗口已经被销毁
    shouldCreate = true;
  }

  if (shouldCreate) {
    createSecWindow();
  }

  return secondaryWindowCreated;
}

export async function showSecWindow() {
  const win = await ensureSecWindow();
  return showWindow(win);
}

export async function hideSecWindow() {
  const win = await ensureSecWindow();
  return hideWindow(win);
}

/**
 *
 * @param {Electron.BrowserWindow} win
 */
function _bindEvents(win) {
  win.on('ready-to-show', () => {
    logger.info('Secondary window ready to show');
    showWindow(win);
  });

  win.on('close', (event) => {
    if (!appIsQuitting) {
      event.preventDefault();
      hideWindow(win);
    }
  });
}
