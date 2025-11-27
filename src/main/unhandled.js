import process from 'node:process';
import { app, dialog, clipboard } from 'electron';
import { t } from 'i18next';

import logger from './logger.js';
import { anyToString } from '@/common/utils.js';
import { toLogFormat } from '@/common/errors.js';

let installed = false;

/**
 * @param {string} title
 * @param {Error} err
 */
function handleError(title, err) {
  const formattedError = toLogFormat(err);
  logger.error(`${title}: ${formattedError}`);

  if (app.isReady()) {
    const buttonIdx = dialog.showMessageBoxSync({
      type: 'error',
      message: title,
      detail: formattedError,
      buttons: [t('appDialog.quit'), t('appDialog.copyAndQuit')],
      noLink: true,
    });

    if (buttonIdx === 1) {
      clipboard.writeText(`${title}\n${formattedError}`);
    }
  } else {
    dialog.showErrorBox(title, formattedError);
  }

  app.exit(1);
}

/**
 * 将任意类型的 rejection value 转换为 Error 对象
 * @param {unknown} reason
 * @returns {Error}
 */
function _toError(reason) {
  if (reason instanceof Error) {
    return reason;
  }

  return new Error(`Promise rejected non-error value: ${anyToString(reason)}`);
}

/**
 * 负责对全局报错进行兜底
 * @returns {void}
 */
export function captureUnhandledRejection() {
  if (installed) {
    return;
  }

  process.on('uncaughtException', (error) => {
    handleError('Uncaught Exception', _toError(error));
  });
  process.on('unhandledRejection', (reason) => {
    handleError('Unhandled Rejection', _toError(reason));
  });

  app.on('render-process-gone', (_, contents, { reason, exitCode }) => {
    if (reason === 'clean-exit') {
      return;
    }

    let url = '[UNKNOWN]';
    try {
      url = contents.getURL();
    } catch (_) {
      // ignore
    }

    handleError(
      'Render Process Gone',
      new Error(`Reason: ${reason}, Exit Code: ${exitCode}, URL: ${url}`)
    );
  });

  installed = true;
}
