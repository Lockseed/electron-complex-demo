import { app } from 'electron';
import { join } from 'node:path';
/**
 * 设置用户数据路径
 * @param {object} [options]
 * @param {string} [options.appName]
 * @param {boolean} [options.isDev]
 */
export default function setPaths({ appName, isDev } = {}) {
  appName = appName ?? app.getName();
  isDev = isDev ?? false;

  const appDirName = isDev ? `${appName}-dev` : appName;
  const userDataPath = join(app.getPath('appData'), appDirName);
  const logDirPath = join(userDataPath, 'logs');
  // 这里其实还可以把用户数据放在其他位置，例如放在用户安装路径下：
  // import { dirname, join } from "node:path";
  // const userDataPath = join(dirname(process.execPath), "data");

  console.log('Set user data path to', userDataPath);

  app.setPath('userData', userDataPath);
  app.setPath('sessionData', userDataPath);
  app.setAppLogsPath(logDirPath);
}
