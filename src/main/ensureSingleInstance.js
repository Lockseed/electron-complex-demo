import { app } from 'electron';
import logger from './logger.js';

export default function ensureSingleInstance() {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    logger.info('Another instance is running, quitting...');
    app.quit();
    process.exit(0);
  }
}
