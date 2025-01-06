import { app } from 'electron';
import logger from './logger.js';

/**
 * @type {(() => void|Promise<any>)[]}
 */
const beforeQuitTasks = [];

/**
 * 将需要在 App 退出前执行的任务统一放在这里
 * @param {()=>void|Promise<any>} task 
 */
export function registerBeforeQuitTask(task) {
  beforeQuitTasks.push(task);
};

export let appIsQuitting = false;

app.on('before-quit', async () => {
  appIsQuitting = true;

  for (const task of beforeQuitTasks) {
    try {
      await task();
    } catch (error) {
      logger.error("Run before quit task error", error?.message);
    }
  }
});