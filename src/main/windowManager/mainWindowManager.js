import { EventEmitter } from 'node:events';
import path from 'node:path';
import { BrowserWindow } from 'electron';

import logger from '../logger.js';
import isDev from '../isDev.js';
import { appIsQuitting } from '../beforeQuitTasks.js';
// import { isWindows, isMacOS } from '../utils';
import { showWindow, hideWindow, handleWindowCreated } from './windowHelpers.js';
import WindowStateManager from './WindowStateManager.js';
import { getMainWindowState, setMainWindowState } from "../store/index.js";
import { getMainProcessAPIMap } from '../handlers.js';
import { getMainProcessEventMap } from '../events.js';
import { whenWorkerReady, rpcMainSide, connectWorkerToRenderer } from '../workerManager.js';

export const mainWindowEventBus = new EventEmitter();

let /** @type {Electron.BrowserWindow|undefined} */ mainWindow;
let /** @type {Promise<Electron.BrowserWindow>} */ mainWindowCreated;
let /** @type {(value:Electron.BrowserWindow) => void} */ resolveMainWindowCreate;

/**
 * 创建主窗口
 * 强制创建，不判断是否已经创建或者正在创建
 * @returns {Promise<Electron.BrowserWindow>}
 */
async function createMainWindow() {
  logger.info("[createMainWindow] Start.");

  const resolvers = Promise.withResolvers();
  mainWindowCreated = resolvers.promise;
  resolveMainWindowCreate = resolvers.resolve;

  const defaultState = { width: 800, height: 600, x: 20, y: 20 };
  const windowState = new WindowStateManager({
    saveState: (state) => setMainWindowState(state),
    loadState: () => getMainWindowState(defaultState),
    defaultState,
  });

  await whenWorkerReady;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    // titleBarStyle: isMacOS ? 'hiddenInset' : isWindows ? 'hidden' : 'default',
    width: windowState.width,
    height: windowState.height,
    minWidth: 400,
    minHeight: 300,
    x: windowState.x,
    y: windowState.y,
    // visualEffectState: 'active',
    // vibrancy: 'under-window',
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      preload: path.join(import.meta.dirname, 'preload.cjs'),
      additionalArguments: await getAdditionalArguments(),
    },
  });

  // 记录主窗口大小位置变化
  windowState.manage(mainWindow);
  // 一些窗口创建后的通用处理逻辑
  handleWindowCreated(mainWindow, "MainWindow");
  // 绑定事件
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

  logger.info("[createMainWindow] Done. Window id:", mainWindow.id);
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
    await createMainWindow();
  }

  return mainWindowCreated;
}

export async function showMainWindow() {
  logger.debug('[mainWindow] showMainWindow');
  const win = await ensureMainWindow();
  return showWindow(win);
}

export async function hideMainWindow() {
  logger.debug('[mainWindow] hideMainWindow');
  const win = await ensureMainWindow();
  return hideWindow(win);
}

/**
 * 
 * @param {Electron.BrowserWindow} win 
 */
function _bindEvents(win) {
  logger.debug("[_bindEvents]");
  win.on('ready-to-show', () => {
    logger.info('Main window ready to show');
    showMainWindow();
  });

  win.on('close', (event) => {
    if (!appIsQuitting) {
      event.preventDefault();
      // TODO: mac 执行隐藏 ，windows 执行最小化
      hideMainWindow();
    }
  });

  win.webContents.on('did-finish-load', () => {
    connectWorkerToRenderer(win.webContents);
  });
}

async function getAdditionalArguments() {
  logger.debug("[mainWindow/getAdditionalArguments] Start.");
  const mainProcessApiMap = getMainProcessAPIMap();
  const mainProcessEventMap = getMainProcessEventMap();

  const workerProcessApiMap = await rpcMainSide.getWorkerProcessAPIMap();
  const workerProcessEventMap = await rpcMainSide.getWorkerProcessEventMap();

  // logger.debug("[mainWindow/getAdditionalArguments] mainProcessApiMap:", mainProcessApiMap);
  // logger.debug("[mainWindow/getAdditionalArguments] mainProcessEventMap:", mainProcessEventMap);
  // logger.debug("[mainWindow/getAdditionalArguments] workerProcessApiMap:", workerProcessApiMap);

  logger.debug("[mainWindow/getAdditionalArguments] End.");
  return [
    '--main-process-api-map=' + JSON.stringify(mainProcessApiMap),
    '--main-process-event-map=' + JSON.stringify(mainProcessEventMap),
    '--worker-process-api-map=' + JSON.stringify(workerProcessApiMap),
    '--worker-process-event-map=' + JSON.stringify(workerProcessEventMap),
  ]
}