import { DatabaseService } from '~services/Database';
import { ENTITIES } from '~constants';
import { classToPlain } from 'class-transformer';

interface Setting {
  key: string;
  id: string;
  value: string;
}

const SettingKeys = [
  'serverUrl',
  'authUsername',
  'authPassword',
  'lastSync',
  'isPassiveSyncEnabled',
  'isIntegrating',
  'defaultLogInterval',
] as const;

export type SettingKey = typeof SettingKeys[number];

export enum SettingType {
  serverUrl = 'string',
  authUsername = 'string',
  authPassword = 'string',
  lastSync = 'number',
  defaultLogInterval = 'number',
  isPassiveSyncEnabled = 'bool',
  isIntegrating = 'bool',
}

export interface SettingMap {
  serverUrl: string;
  authUsername: string;
  authPassword: string;
  lastSync: number;
  isPassiveSyncEnabled: boolean;
  isIntegrating: boolean;
  defaultLogInterval: number;
}

export type SyncSettingMap = Omit<SettingMap, 'defaultLogInterval'>;

export class SettingManager {
  dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  getSetting = async (key: SettingKey): Promise<number | string | null | boolean> => {
    const result = await this.dbService.get(ENTITIES.SETTING, { key });

    if (!result) return null;

    const settingType = SettingType[key];

    if (settingType === 'number') {
      return Number(result.value);
    } else if (settingType === 'string') {
      return result.value;
    } else if (settingType === 'bool') {
      return JSON.parse(result.value);
    } else {
      throw new Error('Unsupported Setting Type for setting key: ' + key);
    }
  };

  getBool = async (key: SettingKey): Promise<boolean> => {
    const result = await this.dbService.get(ENTITIES.SETTING, { key });
    if (!result) return false;
    const { value } = result;

    try {
      const parsed = Boolean(JSON.parse(value));
      if (typeof parsed === 'boolean') {
        return parsed;
      } else {
        return false;
      }
    } catch {
      // Swallow and just return false.
      return false;
    }
  };

  getSettings = async (): Promise<SettingMap> => {
    const getSettingPromises = SettingKeys.map(key =>
      this.getSetting(key as SettingKey).then(result => ({ key, value: result }))
    );
    const settings = await Promise.all(getSettingPromises);

    return settings.reduce((acc, value) => ({ ...acc, [value.key]: value.value }), {
      serverUrl: '',
      authUsername: '',
      authPassword: '',
      lastSync: 0,
      isPassiveSyncEnabled: false,
      isIntegrating: false,
      defaultLogInterval: 300,
    });
  };

  setSetting = async (key: SettingKey, value: string): Promise<Setting> => {
    const result = await this.dbService.upsert(ENTITIES.SETTING, { id: key, key, value });
    return classToPlain(result) as Setting;
  };

  getSyncSettings = async (): Promise<SyncSettingMap> => {
    const { serverUrl, authUsername, authPassword, lastSync, isPassiveSyncEnabled, isIntegrating } =
      await this.getSettings();

    return {
      serverUrl,
      authUsername,
      authPassword,
      lastSync,
      isPassiveSyncEnabled,
      isIntegrating,
    };
  };
}
