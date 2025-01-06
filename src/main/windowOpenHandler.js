import { webContents } from "electron";

// (method) Electron.WebContents.setWindowOpenHandler(handler: (details: Electron.HandlerDetails) => Electron.WindowOpenHandlerResponse): void

/**
 * 
 * @param {Electron.WebContents} contents 
 */
export function setWindowOpenHandler(contents) {
  contents.setWindowOpenHandler(({ url }) => {
    console.log("windowOpenHandler", url);
    return {
      action: "deny"
    }
  });
}