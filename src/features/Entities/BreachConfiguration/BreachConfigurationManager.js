import { ENTITIES } from '~constants';

const REPORT = `
select description "Breach Name", duration / 60000 "Number of Minutes", 
case when id = "HOT_BREACH" or id = "COLD_BREACH" then "Continuous" else "Cumulative" end as "Breach Type",
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then minimumTemperature else maximumTemperature end as Temperature,
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then "Max" else "Min" end as Direction
from temperaturebreachconfiguration
`;

export class BreachConfigurationManager {
  constructor(databaseService) {
    this.databaseService = databaseService;
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

  report = async () => {
    return this.databaseService.query(REPORT);
  };
}
