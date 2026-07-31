import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationTH from '../locales/th/translation.json';
import translationEN from '../locales/en/translation.json';

const resources = {
  th: {
    translation: translationTH,
  },
  en: {
    translation: translationEN,
  },
};

const savedLanguage = (typeof window !== 'undefined' && localStorage.getItem('snuzeflow_lang')) || 'th';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
