import { ipcMain } from "electron";
import logger from "./logger.js";
import { IPC_API_CHANNEL_NAME } from "@/common/constants";

const calculatorHandlers = {
  add(_, a, b) {
    logger.debug("calculator::add called with args: ", a, b);
    return a + b;
  }
}

const allHandlers = {
  calculator: calculatorHandlers
};

/**
 * 注册 remoteAPIHandlers
 * 注意需要在窗口创建之前调用
 */
export function registerAPIHandlers() {
  /**
   * @callback
   * @param {Electron.IpcMainInvokeEvent} event 
   * @param  {...any} args 
   */
  const handleIPCMessage = async (event, ...args) => {
    const [channel, ...handlerArgs] = args || [];
    if (!channel || typeof channel !== "string") {
      logger.error("Invalid IPC message received. Channel name is missing or invalid.");
      return;
    }

    const [namespace, handlerName] = channel.split("::");
    if (!namespace || !handlerName) {
      logger.error("Invalid IPC message received. Channel name is missing or invalid: ", channel);
      return;
    }

    const /** @type {function} */ handler = allHandlers[namespace]?.[handlerName];

    if (!handler) {
      logger.error("No handler found for the given channel: ", channel);
      return;
    }

    logger.debug("[ipc-api]", channel, handlerArgs);

    const result = await handler(event, ...handlerArgs);

    logger.debug("[ipc-api]", channel, "Done");

    return result;
  };

  ipcMain.handle(IPC_API_CHANNEL_NAME, async (event, ...args) => {
    return await handleIPCMessage(event, ...args)
  });

  ipcMain.on(IPC_API_CHANNEL_NAME, (event, ...args) => {
    handleIPCMessage(event, ...args)
      .then(result => event.returnValue = result)
      .catch(error => logger.error("Error handling IPC message", error));
  });
}

/**
 * 用于将主进程的 Remote API 暴露给窗口
 * @returns {[string, string[]][]}
 */
export function getMainProcessAPIMap() {
  return Object.entries(allHandlers).map(([namespace, handlerObj]) => {
    return [namespace, Object.keys(handlerObj)];
  });
  // return [["calculator", ["add"]]];
}