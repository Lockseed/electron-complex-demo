import logger from "../logger.js";
import handleUrl from "../handleUrl.js";
import { toLogFormat } from "@/common/errors.js";
import { tryParseUrl } from "../utils.js";

/**
 * 
 * @param {Electron.WebContents} webContents 
 */
export const waitTileCanExecuteJavascript = async (webContents) => {
  if (webContents.getURL() && !webContents.isLoadingMainFrame()) {
    return;
  }

  return new Promise((resolve) => {
    webContents.once('did-stop-loading', () => {
      resolve();
    });
  })
};

/**
 * 显示窗口 处理一些特殊情况。
 * @param {Electron.BrowserWindow} win 
 */
export function showWindow(win) {
  if (!win || win.isDestroyed()) return;

  if (win.isVisible()) {
    win.show();
    win.focus();
  } else if (win.isMinimized()) {
    win.restore();
    setTimeout(() => {
      win.show();
      win.focus();
    }, 100);
  } else {
    win.show();
  }
}

/**
 * 隐藏窗口 处理一些特殊情况。
 * @param {Electron.BrowserWindow} win 
 */
export function hideWindow(win) {
  if (!win || win.isDestroyed()) return;

  if (win.isFullScreen()) {
    win.once('leave-full-screen', () => {
      win.hide();
    });
    win.setFullScreen(false);
  } else {
    win.hide();
  }

}

export function isInternalUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }
  const parsedUrl = tryParseUrl(url);
  if (!parsedUrl) {
    return false;
  }

  const { protocol, hostname } = parsedUrl;

  // 开发模式的 HMR 无需特殊处理
  if (protocol === "http:" || protocol === "https:") {
    if (hostname === "localhost") {
      return true;
    }
  }

  return false;
}

/**
 * 进行一些一般业务窗口创建后的统一处理
 * 例如组织跳转和导航的默认行为，等
 * @param {Electron.BrowserWindow} window 
 * @param {string} windowName 
 */
export function handleWindowCreated(window, windowName) {
  logger.info(`[handleWindowCreated] Handle ${windowName} created.`);
  window.webContents.on("will-navigate", (event, url) => {
    logger.debug(`[willNavigate][${windowName}] url: ${url}`);

    if (isInternalUrl(url)) {
      return;
    }

    event.preventDefault();
    handleUrl(url).catch((_) => {});
  });

  window.webContents.setWindowOpenHandler(({ url, disposition }) => {
    logger.debug(`[windowOpenHandler][${windowName}] url: ${url}, disposition: ${disposition}`);

    handleUrl(url).catch((_) => {});
    return { action: "deny" }
  });

  window.webContents.on("preload-error", (_, preloadPath, error) => {
    logger.error(`[preloadError][${windowName}] preload error in ${preloadPath}`, toLogFormat(error));
  });
}