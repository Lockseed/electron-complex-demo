import path from "node:path";
import { app } from "electron";
import isDev from "./isDev.js";
import logger from "./logger.js";

let protocol = isDev ? 'electron-demo-dev' : 'electron-demo';

/**
 * @see https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
 * 1. 需要将 App 设置为 protocol 对应的 default client，而且需要考虑开发模式下的特殊处理
 * 2. macOS 下通过 open-url 事件处理
 * 3. Windows 下通过 second-instance 事件处理
 */
export function setupDeepLink() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(
        protocol, 
        process.execPath, 
        [path.resolve(process.argv[1])]
      );
      logger.log(`[setupDeepLink] Set as default protocol client: ${protocol}`);
      logger.log('[setupDeepLink] process.execPath:', process.execPath);
    }
  } else {
    app.setAsDefaultProtocolClient(protocol);
    logger.log(`[setupDeepLink] Set as default protocol client: ${protocol}`);
  }

  // macOS 下通过 open-url 事件处理
  app.on('open-url', (event, url) => {
    event.preventDefault();
    logger.log('[setupDeepLink][open-url] url:', url);
    // TODO: 处理 url
  });

  // Windows 下通过 second-instance 事件处理
  app.on('second-instance', (event, argv, workingDirectory) => {
    logger.log('[setupDeepLink][second-instance] argv:', argv);
    const url = argv.pop();
    if (url?.startsWith(`${protocol}://`)) {
      event.preventDefault();
      logger.log('[setupDeepLink][second-instance] url:', url);
      // TODO: 处理 url
    }
  });
}
