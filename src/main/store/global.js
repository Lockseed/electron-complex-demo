import { app } from 'electron';
// import Conf from "conf/dist/source";
import Store from "electron-store";

// import logger from "@/main/logger.js";

const resolvers = Promise.withResolvers();
/** @type {Promise<Store<Record<string, unknown>>>} */
export const whenGlobalStoreReady = resolvers.promise;

let /** @type {Store<Record<string, unknown>>|undefined} */ globalStore;

/**
 * 初始化全局设置文件
 * 必须在设置好应用的各种 path 之后才能执行tions
 */
export function initGlobalStore() {
  globalStore = new Store({ 
    name: "global-config", 
    cwd: app.getPath("userData"),
  });
  resolvers.resolve(globalStore);
}

export function openGlobalStoreFile() {
  return globalStore.openInEditor();
}

/**
 * @typedef {Object} WindowState
 * @property {number} width
 * @property {number} height
 * @property {number} x
 * @property {number} y
 */

/**
 * 
 * @param {WindowState} windowState 
 * @returns 
 */
export function setMainWindowState(windowState) {
  if (!globalStore) throw new Error("GlobalStore not initialized"); 
  return globalStore.set("mainWindowState", windowState);
}

/**
 * 
 * @returns {any}
 */
export function getMainWindowState(defaultState = { width: 800, height: 600, x: 20, y: 20 }) {
  if (!globalStore) throw new Error("GlobalStore not initialized"); 
  return globalStore.get("mainWindowState", defaultState);
}