import process from "node:process";
import { app, dialog, clipboard } from "electron";

let installed = false;

/**
 * @callback
 * @param {string} title 
 * @param {Error|any} err 
 */
function handleError(title, err) {
  console.error(err);
  // TODO 打日志 弹出对话框 ...
}

export function captureUnhandledRejection() {
  if (installed) {
    return;
  }

  process.on('uncaughtException', (error) => {
    handleError('Uncaught Exception', error);
  });
  process.on('unhandledRejection', (reason) => {
    handleError('Unhandled Rejection', reason);
  });

  installed = true;
}