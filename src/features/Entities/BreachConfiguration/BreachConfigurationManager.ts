import { ENTITIES } from '../../../common/constants';
import { DatabaseService } from '../../../common/services';
import { classToPlain } from 'class-transformer';

const REPORT = `
select description "Breach Name", duration / 60000 "Number of Minutes", 
case when id = "HOT_BREACH" or id = "COLD_BREACH" then "Continuous" else "Cumulative" end as "Breach Type",
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then minimumTemperature else maximumTemperature end as Temperature,
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then "Max" else "Min" end as Direction
from temperaturebreachconfiguration
`;

interface TemperatureBreachConfiguration {
  id: string;
  minimumTemperature: number;
  maximumTemperature: number;
  duration: number;
  colour: string;
  description: string;
}

export class BreachConfigurationManager {
  databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  upsert = async (
    objectOrObjects: Partial<TemperatureBreachConfiguration> | TemperatureBreachConfiguration[]
  ): Promise<TemperatureBreachConfiguration | TemperatureBreachConfiguration[]> => {
    return this.databaseService.upsert(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION, objectOrObjects);
  };

  getAll = async (): Promise<TemperatureBreachConfiguration[]> =>
    this.databaseService
      .getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION)
      .then(tbc =>
        tbc.map(
          (config: TemperatureBreachConfiguration) =>
            classToPlain(config) as TemperatureBreachConfiguration
        )
      );

  updateField = async (
    id: string,
    key: string,
    value: string | number
  ): Promise<TemperatureBreachConfiguration | TemperatureBreachConfiguration[]> => {
    return this.upsert({ id, [key]: value });
  };

  report = async (): Promise<any> => {
    return this.databaseService.query(REPORT);
  };
}
