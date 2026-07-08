import { join } from 'node:path';
import log from 'electron-log';
import dayjs from 'dayjs';

export const logger = log.scope('worker');

const isNodeEnvSet = 'NODE_ENV' in process.env;
const getFromNodeEnv = process.env.NODE_ENV !== 'production';
const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
const isDev = isEnvSet ? getFromEnv : isNodeEnvSet ? getFromNodeEnv : false;

// log.initialize({
//   preload: false,
// });

log.transports.file.level = isDev ? 'debug' : 'info';
log.transports.file.maxSize = 0;
log.transports.file.resolvePathFn = (variables) => {
  const filename = `${dayjs().format('YYYY-MM-DD')}.log`;
  return join(variables.electronDefaultDir, filename);
};

// 主进程日志无需发送到渲染进程
log.transports.ipc.level = false;
