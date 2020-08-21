import i18n from 'i18n-js';
import * as RNLocalize from 'react-native-localize';

const { languageTag } = RNLocalize.findBestAvailableLanguage(['en']);

const AVAILABLE_TRANSLATIONS = { en: require('./en.json') };

i18n.fallbacks = true;
i18n.translations = AVAILABLE_TRANSLATIONS;

export const t = (scope, options) => i18n.t(scope, { languageTag, ...options });
