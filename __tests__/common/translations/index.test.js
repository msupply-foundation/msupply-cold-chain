import { t } from '~translations';

describe('Translations: t', () => {
  it('Correctly translates a basic translation', () => {
    const translation = t('MAIN_TABS/Sensors');
    expect(translation).toBe('Sensors');
  });
  it('Throws an error when DEV flag is set and the translation does not exist', () => {
    expect(() => t('x')).toThrow();
  });
  it('Does not throw an error when the DEV flag is not set, and the translation does not exist', () => {
    __DEV__ = false;
    expect(t('x')).toBe('');
  });
});
