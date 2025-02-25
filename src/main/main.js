import { app } from 'electron';
import started from 'electron-squirrel-startup';
import isDev from './isDev.js';
import logger, { initLogger } from './logger.js';
import setPaths from './setPaths.js';
import applyCommandLineSwitches from './applyCommandLineSwitches.js';
import ensureSingleInstance from './ensureSingleInstance.js';
import { captureUnhandledRejection } from './unhandled.js';
import { setupDeepLink } from './deepLink.js';
import { registerProtocolHandler } from './protocol.js';
import { registerAPIHandlers } from "./handlers.js";
import { registerRemoteEvents } from './events.js';
import { initI18n } from './i18n/index.js';
import { initGlobalStore } from './store/index.js';
import { showMainWindow } from "./windowManager/index.js";
import { setupApplicationMenu } from './menu.js';

// 根据应用名称和当前环境等，设置应用的数据目录
// 这一类操作对后续影响很大，必须优先完成
setPaths({ isDev });

// 初始化日志 相对优先级较高
initLogger();
logger.info("APP_START");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// 确保单一实例 防止重复启动
ensureSingleInstance();

// 设置全局的命令行参数 包含渲染进程 V8 flags
applyCommandLineSwitches();

// 初始化 i18n
await initI18n("zh-CN");

// 捕获全局未处理的 rejection
captureUnhandledRejection();

// 将当前 App 设置为指定 protocol 的默认客户端
setupDeepLink();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady()
  .then(() => { logger.info("APP_READY"); })
  // .then(() => initI18n("zh-CN"))
  // .then(captureUnhandledRejection)
  .then(registerProtocolHandler)
  .then(registerAPIHandlers)
  .then(registerRemoteEvents)
  .then(initGlobalStore)
  .then(showMainWindow)
  .then(setupApplicationMenu)
  .catch(e => logger.error("APP_INIT_ERROR", e));


app.on('activate', () => {
  logger.info("APP_ACTIVATE");
  // 一般情况下这里会判断如果当前没有窗口了，则重新创建住窗口
  // 但是在这里由于软件运行期间，我们的主窗口只会被隐藏或最小化
  // 所以当应用重新 activate 时，直接把主窗口 show 就来就好
  if (app.isReady()) {
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
