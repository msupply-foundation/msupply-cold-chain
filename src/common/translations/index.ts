import i18n from 'i18n-js';
import * as RNLocalize from 'react-native-localize';

const { languageTag } = RNLocalize.findBestAvailableLanguage(['en']) ?? {};

const AVAILABLE_TRANSLATIONS = { en: require('./en.json') };

i18n.fallbacks = true;
i18n.translations = AVAILABLE_TRANSLATIONS;

export const t = (scope: i18n.Scope, options: i18n.TranslateOptions) => {
  const translation = i18n.t(scope, { languageTag, ...options });

  // Catch missing translations - throw errors in dev, but return an empty string in
  // production.
  if (translation.match(/missing/)) {
    if (__DEV__) throw new Error(translation);
    return '';
  }

  return translation;
};
