import { join } from "node:path";
import log from "electron-log";
import dayjs from "dayjs";

import isDev from "@/main/isDev.js";

export const logger = log.scope("worker");

// log.initialize({
//   preload: false,
// });

log.transports.file.level = isDev ? "debug" : "info";
log.transports.file.maxSize = 0;
log.transports.file.resolvePathFn = (variables) => {
  const filename = `${dayjs().format("YYYY-MM-DD")}.log`;
  return join(variables.electronDefaultDir, filename);
};

// 主进程日志无需发送到渲染进程
log.transports.ipc.level = false;
