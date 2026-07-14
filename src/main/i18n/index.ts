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

type SupportedLanguage = 'en' | 'zh-CN';

const supportedLngs: Record<'en' | 'zh', SupportedLanguage> = {
  en: 'en',
  zh: 'zh-CN',
};

// 初始化主进程中使用的 i18n
/**
 *
 * @param {string} lng
 */
export async function initI18n(lng: string = supportedLngs.en): Promise<void> {
  const supportedValues = Object.values(supportedLngs) as SupportedLanguage[];

  const resolvedLng: SupportedLanguage = (() => {
    // 如果传入的语言不是支持的语言，尝试通过当前系统设置的偏好语言选择
    if (!supportedValues.includes(lng as SupportedLanguage)) {
      const systemLocal = app.getPreferredSystemLanguages()[0] || '';
      if (systemLocal.startsWith('zh')) return supportedLngs.zh;
      else return supportedLngs.en;
    }
    return lng as SupportedLanguage;
  })();

  try {
    await i18next.init({
      lng: resolvedLng,
      resources,
      fallbackLng: 'en',
      supportedLngs: supportedValues,
    });
  } catch (error) {
    logger.error('Init i18n error', error instanceof Error ? error.message : String(error));
    throw error;
  }
}
