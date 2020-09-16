import { SETTING, ENTITIES } from '~constants';

const DEFAULTS = {
  [SETTING.INT.DEFAULT_LOG_INTERVAL]: '300',
};

export class SettingManager {
  constructor(dbService, defaultSettings = DEFAULTS) {
    this.dbService = dbService;
    this.settings = defaultSettings;
  }

  get settingKeys() {
    return Object.keys(this.settings);
  }

  isValidKey = key => {
    return this.settingKeys.includes(key);
  };

  getSetting = async key => {
    const isValid = this.isValidKey(key);

    if (!isValid) throw new Error();

    let [result] = await this.dbService.queryWith(ENTITIES.SETTING, { key });
    if (!result) {
      const query = { key, value: this.settings[key] };
      result = await this.dbService.upsert(ENTITIES.SETTING, query);
    }

    return result;
  };

  getSettings = async () => {
    const getSettingPromises = this.settingKeys.map(key => this.getSetting(key));
    return Promise.all(getSettingPromises);
  };

  setSetting = async (key, value) => {
    const isValid = this.isValidKey(key);

    if (!(typeof value === 'string' && isValid)) {
      throw new Error();
    }

    const setting = await this.getSetting(key);
    const result = await this.dbService.upsert(ENTITIES.SETTING, { ...setting, value });

    return result;
  };
}
