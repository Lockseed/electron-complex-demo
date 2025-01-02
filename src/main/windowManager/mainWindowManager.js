import { EventEmitter } from 'node:events';
import path from 'node:path';
import { BrowserWindow } from 'electron';

import logger from '../logger';
import isDev from '../isDev';
import { isWindows, isMacOS } from '../utils';
import { showWindow, hideWindow } from './windowHelpers';
import { getMainProcessAPIMap } from '../handlers';
import { getMainProcessEventMap } from '../events';

export const mainWindowEventBus = new EventEmitter();

let /** @type {Electron.BrowserWindow|undefined} */ mainWindow;
let /** @type {Promise<Electron.BrowserWindow>} */ mainWindowCreated;
let /** @type {(value:Electron.BrowserWindow) => void} */ resolveMainWindowCreate;

/**
 * 创建主窗口
 * 强制创建，不判断是否已经创建或者正在创建
 * @returns {Electron.BrowserWindow}
 */
function createMainWindow() {
  logger.info("Creating main window...");

  const resolvers = Promise.withResolvers();
  mainWindowCreated = resolvers.promise;
  resolveMainWindowCreate = resolvers.resolve;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    titleBarStyle: isMacOS ? 'hiddenInset' : isWindows ? 'hidden' : 'default',
    width: 800,
    height: 600,
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
      additionalArguments: getAdditionalArguments(),
    },
  });

  _bindEvents(mainWindow);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(import.meta.dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  isDev && mainWindow.webContents.openDevTools();

  resolveMainWindowCreate(mainWindow);

  logger.info("Main window created.");
  return mainWindow;
}

/**
 * 确保主窗口已经创建
 * @returns {Promise<Electron.BrowserWindow>}
 */
export async function ensureMainWindow() {
  let shouldCreate = false;

  if (!mainWindow && !mainWindowCreated) {
    // Case1: 没有创建主窗口，也不是在创建过程中
    shouldCreate = true;
  } else if (mainWindow && mainWindow.isDestroyed()) {
    // Case2: 主窗口已经被销毁
    shouldCreate = true;
  }

  if (shouldCreate) {
    createMainWindow();
  }


  return mainWindowCreated;
}

export async function showMainWindow() {
  const win = await ensureMainWindow();
  return showWindow(win);
}

export async function hideMainWindow() {
  const win = await ensureMainWindow();
  return hideWindow(win);
}

/**
 * 
 * @param {Electron.BrowserWindow} win 
 */
function _bindEvents(win) {
  win.on('ready-to-show', () => {
    logger.info('Main window ready to show');
    showWindow(win);
  });

  // win.on('close', (event) => {
  //   event.preventDefault();
  //   hideWindow(win);
  // });
}

function getAdditionalArguments() {
  return [
    '--main-process-api-map=' + JSON.stringify(getMainProcessAPIMap()),
    '--main-process-event-map='+ JSON.stringify(getMainProcessEventMap()),
  ]
}