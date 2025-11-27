import { app } from 'electron';
import i18next from 'i18next';
import logger from '../logger.js';

import zhCN from './zh-CN.json' with { type: 'json' };
import en from './en.json' with { type: 'json' };

// 这里只加载主进程中使用的 i18n 资源
const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN },
};

const supportedLngs = {
  en: 'en',
  zh: 'zh-CN',
};

// 初始化主进程中使用的 i18n
/**
 *
 * @param {string} lng
 */
export async function initI18n(lng = supportedLngs.en) {
  lng = (() => {
    // 如果传入的语言不是支持的语言，尝试通过当前系统设置的偏好语言选择
    if (!Object.values(supportedLngs).includes(lng)) {
      const systemLocal = app.getPreferredSystemLanguages()[0] || '';
      if (systemLocal.startsWith('zh')) return supportedLngs.zh;
      else return supportedLngs.en;
    }
    return lng;
  })();

  try {
    await i18next.init({
      lng,
      resources,
      fallbackLng: 'en',
      supportedLngs: Object.values(supportedLngs),
    });
  } catch (error) {
    logger.error('Init i18n error', error?.message);
    throw error;
  }
}
