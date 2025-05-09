import { join } from "node:path";
import log from "electron-log";
import dayjs from "dayjs";
import isDev from "./isDev.js";
import { registerBeforeQuitTask } from "./beforeQuitTasks.js";

export default log.scope("main");

let initialized = false;
/**
 * 在设置好 App 应用名称和目录后再初始化 Logger
 */
export function initLogger() {
  if (initialized) {
    return;
  }
  log.initialize({
    preload: false,
  });
  
  log.transports.file.level = isDev ? "debug" : "info";
  log.transports.file.maxSize = 0;
  log.transports.file.resolvePathFn = (variables) => {
    const filename = `${dayjs().format("YYYY-MM-DD")}.log`;
    return join(variables.electronDefaultDir, filename);
  };

  // 主进程日志无需发送到渲染进程
  log.transports.ipc.level = false;

  registerBeforeQuitTask(() => {
    log.transports.file.level = false;
  });

  console.log("[initLogger] Logger initialized ", log.transports.file.getFile().path);
}