import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '@/public/locales/en/translation.json';
import teTranslation from '@/public/locales/te/translation.json';

const isServer = typeof window === 'undefined';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      te: { translation: teTranslation },
    },
    fallbackLng: 'en',
    lng: isServer ? 'en' : undefined, // Force 'en' on server
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18next;
