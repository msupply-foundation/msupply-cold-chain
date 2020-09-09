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
  minimumTemperature: 8,
  maximumTemperature: 999,
  duration: MILLISECONDS.ONE_MINUTE * 30,
  description: 'Hot breach',
};

const HOT_CUMULATIVE = {
  id: 'HOT_CUMULATIVE',
  minimumTemperature: 8,
  maximumTemperature: 999,
  duration: MILLISECONDS.ONE_MINUTE * 60,
  description: 'Hot cumulative',
};

const COLD_CUMULATIVE = {
  id: 'COLD_CUMULATIVE',
  minimumTemperature: -999,
  maximumTemperature: 2,
  duration: MILLISECONDS.ONE_MINUTE * 40,
  description: 'Cold cumulative',
};

const REPORT = `
select description "Breach Name", duration / 60000 "Number of Minutes", 
case when id = "HOT_BREACH" or id = "COLD_BREACH" then "Continuous" else "Cumulative" end as "Breach Type",
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then minimumTemperature else maximumTemperature end as Temperature,
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then "Max" else "Min" end as Direction
from temperaturebreachconfiguration
`;

export class BreachConfigurationManager {
  constructor(
    databaseService,
    defaultConfigs = [COLD_BREACH, HOT_BREACH, COLD_CUMULATIVE, HOT_CUMULATIVE]
  ) {
    this.databaseService = databaseService;
    this.defaultConfigs = defaultConfigs;
  }

  upsert = async objectOrObjects => {
    return this.databaseService.upsert(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION, objectOrObjects);
  };

  getAll = async () => {
    return this.databaseService.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);
  };

  updateField = async (id, key, value) => {
    return this.upsert({ id, [key]: value });
  };

  init = async () => {
    const configs = await this.getAll();

    if (configs.length >= 4) return configs;
    return this.upsert(this.defaultConfigs);
  };

  report = async () => {
    const manager = await this.databaseService.getEntityManager();
    return manager.query(REPORT);
  };
}
