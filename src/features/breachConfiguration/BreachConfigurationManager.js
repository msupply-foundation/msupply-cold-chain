import { ENTITIES, MILLISECONDS } from '~constants';

const COLD_BREACH = {
  id: 'COLD_BREACH',
  minimumTemperature: -999,
  maximumTemperature: 2,
  duration: MILLISECONDS.ONE_MINUTE * 20,
  description: 'Cold breach',
};

const HOT_BREACH = {
  id: 'HOT_BREACH',
  minimumTemperature: 999,
  maximumTemperature: 8,
  duration: MILLISECONDS.ONE_MINUTE * 120,
  description: 'Hot breach',
};

export class BreachConfigurationManager {
  constructor(databaseService, defaultConfigs = [COLD_BREACH, HOT_BREACH]) {
    this.databaseService = databaseService;
    this.defaultConfigs = defaultConfigs;
  }

  upsert = async objectOrObjects => {
    this.databaseService.upsert(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION, objectOrObjects);
  };

  getAll = async () => {
    return this.databaseService.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);
  };

  updateField = async (id, key, value) => {
    return this.upsert({ id, [key]: value });
  };

  init = async () => {
    const configs = await this.getAll();
    if (configs.length >= 2) return configs;
    return this.upsert(this.defaultConfigs);
  };
}
