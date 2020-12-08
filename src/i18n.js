import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import moment from 'moment';

import en from '../translations/en';
import enGB from '../translations/en-GB';
import es from '../translations/es';
import ptBR from '../translations/pt-BR';
import de from '../translations/de';
import fr from '../translations/fr';

export const languages = {
  de: {
    flag: '🇩🇪',
    name: 'Deutsch (DE)',
  },
  en: {
    flag: '🇺🇸',
    name: 'English (US)',
  },
  'en-GB': {
    flag: '🇬🇧',
    name: 'English (UK)',
  },
  es: {
    flag: '🇪🇸',
    name: 'Español (ES)',
  },
  fr: {
    flag: '🇫🇷',
    name: 'Français (FR)',
  },
  'pt-BR': {
    flag: '🇧🇷',
    name: 'Português (BR)',
  },
};

const resources = {
  en,
  'en-GB': enGB,
  es,
  'pt-BR': ptBR,
  de,
  fr,
};

if (process.env.NODE_ENV === 'development') {
  languages.test = { flag: '👀', name: 'Test' };
  resources.test = require('../translations/fake').default;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    keySeparator: false,
    nsSeparator: false,
    supportedLngs: Object.keys(languages),
    interpolation: {
      escapeValue: false,
      format: (value, format) => {
        if (value instanceof Date) {
          return moment(value).format(format);
        }

        return value;
      },
    },
    react: {
      wait: true,
    },
  });

i18n.on('languageChanged', (lng) => {
  moment.locale(lng);
});

moment.locale(i18n.language);
