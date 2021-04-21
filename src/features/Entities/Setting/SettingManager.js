import { SETTING, ENTITIES } from '../../../common/constants';

const DEFAULTS = {
  [SETTING.BLUETOOTH.DEFAULT_LOG_INTERVAL]: '300',
  [SETTING.SYNC.AUTH_URL]: 'http://10.0.2.2:8080/coldchain/v1/login',
  [SETTING.SYNC.SENSOR_URL]: 'http://10.0.2.2:8080/coldchain/v1/sensor',
  [SETTING.SYNC.TEMPERATURE_LOG_URL]: 'http://10.0.2.2:8080/coldchain/v1/temperature-log',
  [SETTING.SYNC.TEMPERATURE_BREACH_URL]: 'http://10.0.2.2:8080/coldchain/v1/temperature-breach',
  [SETTING.SYNC.AUTH_USERNAME]: 'GEN',
  [SETTING.SYNC.AUTH_PASSWORD]: 'secret',
  [SETTING.SYNC.LAST_SYNC]: 0,
  [SETTING.SYNC.IS_PASSIVE_SYNC_ENABLED]: false,
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
