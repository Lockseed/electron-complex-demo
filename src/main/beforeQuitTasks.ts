import { app } from 'electron';
import logger from './logger.js';

type BeforeQuitTask = () => void | Promise<unknown>;

const beforeQuitTasks: BeforeQuitTask[] = [];

/**
 */
export function registerBeforeQuitTask(task: BeforeQuitTask): void {
  beforeQuitTasks.push(task);
}

export let appIsQuitting = false;

app.on('before-quit', async () => {
  appIsQuitting = true;

  for (const task of beforeQuitTasks) {
    try {
      await task();
    } catch (error) {
      logger.error(
        'Run before quit task error',
        error instanceof Error ? error.message : String(error)
      );
    }
  }
});
