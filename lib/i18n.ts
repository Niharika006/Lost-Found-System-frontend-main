import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next);

// Flag to ensure i18n.init is called only once
let i18nInitialized = false;

if (!i18nInitialized) {
  i18n.init({
    fallbackLng: ['en'],
    debug: true,
    supportedLngs: ['en', 'hi', 'mr', 'bh', 'bn', 'ta'],
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
      format: (value, format, lng, options) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        return value;
      },
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    react: {
      useSuspense: true,
    },
  });
  i18nInitialized = true;
}

export default i18n;
