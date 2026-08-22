import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './locales/en.json'
import zh from './locales/zh.json'
import LanguageDetector from 'i18next-browser-languagedetector';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

const resources = {
  "en": {
    translation: en
  },
  "zh": {
    translation: zh
  }
}

const currentLocale = localStorage.getItem('i18nextLng') || 'zh';
i18n
  // 将 i18n 实例传递给 react-i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  // 初始化 i18next
  // 所有配置选项: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    fallbackLng: currentLocale, // 默认当前的语言环境
    lng: currentLocale,
    supportedLngs: ['zh', 'en'],
    load: 'languageOnly', // 将 zh-CN 归约为 zh，确保 localStorage 存储的是 'zh' 而非 'zh-CN'
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

// 设置 dayjs 语言
dayjs.locale(currentLocale === 'zh' ? 'zh-cn' : 'en');

export default i18n;
