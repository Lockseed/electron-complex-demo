
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