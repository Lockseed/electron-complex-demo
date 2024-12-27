import { app } from 'electron';
import logger from './logger.js';

/**
 * @type {(() => void)[]}
 */
const beforeQuitTasks = [];

/**
 * 将需要在 App 退出前执行的任务统一放在这里
 * @param {()=>void} task 
 */
export default function registerBeforeQuitTask(task) {
  beforeQuitTasks.push(task);
};

app.on('before-quit', () => {
  beforeQuitTasks.forEach(task => {
    try {
      task();
    } catch (error) {
      logger.error("Run before quit task error", error?.message);
    }
  });
});