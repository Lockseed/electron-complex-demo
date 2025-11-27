// import { join,  } from "node:path";
// import { pathToFileURL, fileURLToPath } from "node:url";
import { app, net, protocol } from 'electron';
import logger from './logger.js';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: true,
      stream: true,
    },
  },
]);

/**
 * 应用中所有通过 file:// 读取的地方都会被这里拦截，包括窗口加载 html/js/css 等。
 * @param {GlobalRequest} request
 * @returns {Promise<GlobalResponse>}
 */
async function handleFileRequest(request) {
  const clonedRequest = Object.assign(request.clone(), {
    bypassCustomProtocolHandlers: true,
  });

  // 这里可以做些特殊处理，比如只允许使用 file:// 访问安装路径下或者用户数据文件夹下的文件

  const userDataDir = app.getPath('userData');
  const appPath = app.getAppPath();
  const filePath = (() => {
    const urlObject = new URL(request.url);
    const pathname = urlObject.pathname;
    return decodeURIComponent(pathname);
  })();
  const accessible = [userDataDir, appPath].some((dir) => filePath.startsWith(dir));

  if (!accessible) {
    logger.warn('Blocked file request', filePath);
    return new Response(null, { status: 403, statusText: 'Forbidden' });
  }

  return net.fetch(request.url, clonedRequest);
}

export function registerProtocolHandler() {
  protocol.handle('file', (request) => {
    return handleFileRequest(request);
  });
}
