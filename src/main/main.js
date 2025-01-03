import path from 'node:path';
import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import isDev from './isDev.js';
import logger, { initLogger } from './logger.js';
import setPaths from './setPaths.js';
import ensureSingleInstance from './ensureSingleInstance.js';
import { setupDeepLink } from './deepLink.js';
import { registerProtocolHandler } from './protocol.js';
import { registerAPIHandlers } from "./handlers.js";
import { registerRemoteEvents } from './events.js';
import { showMainWindow } from "./windowManager";

// 根据应用名称和当前环境等，设置应用的数据目录
setPaths({ isDev });

// 初始化日志
initLogger();
logger.info("APP_START");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// 确保单一实例 防止重复启动
ensureSingleInstance();

// 将当前 App 设置为指定 protocol 的默认客户端
setupDeepLink();

// const createWindow = () => {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(import.meta.dirname, 'preload.cjs'),
//     },
//   });

//   // and load the index.html of the app.
//   if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//     mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
//   } else {
//     mainWindow.loadFile(path.join(import.meta.dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
//   }

//   // Open the DevTools.
//   mainWindow.webContents.openDevTools();
// };

const createSecondaryWindow = () => {
  // Create the browser window.
  const secondaryWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.cjs'),
    },
  });

  // and load the index.html of the app.
  if (SECONDARY_WINDOW_VITE_DEV_SERVER_URL) {
    secondaryWindow.loadURL(SECONDARY_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    secondaryWindow.loadFile(path.join(import.meta.dirname, `../renderer/${SECONDARY_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  secondaryWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady()
  .then(() => { logger.info("APP_READY"); })
  .then(registerProtocolHandler)
  .then(registerAPIHandlers)
  .then(registerRemoteEvents)
  .then(showMainWindow)
  .then(createSecondaryWindow)
  .catch(e => console.error(e))

// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  logger.info("APP_ACTIVATE");
  if (BrowserWindow.getAllWindows().length === 0) {
    showMainWindow();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
