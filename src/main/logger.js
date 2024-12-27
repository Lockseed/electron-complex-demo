import { join } from "node:path";
import log from "electron-log";
import dayjs from "dayjs";

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
  
  log.transports.file.level = 'info';
  log.transports.file.maxSize = 0;
  log.transports.file.resolvePathFn = (variables) => {
    const filename = `${dayjs().format("YYYY-MM-DD")}.log`;
    return join(variables.electronDefaultDir, filename);
  };

  console.log("[initLogger] Logger initialized ", log.transports.file.getFile().path);
}