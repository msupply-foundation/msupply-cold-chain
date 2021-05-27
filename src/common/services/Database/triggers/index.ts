import { DatabaseService } from '~services/Database';
import { SensorTrigger } from './Sensor';
import { TemperatureBreachTrigger } from './TemperatureBreach';
import { TemperatureLogTrigger } from './/TemperatureLog';

export interface Trigger {
  install: (dbService: DatabaseService) => Promise<void>;
  remove: (dbService: DatabaseService) => Promise<void>;
}

const triggers: Trigger[] = [
  SensorTrigger.syncOnInsert,
  SensorTrigger.syncOnUpdate,
  TemperatureLogTrigger.syncOnInsert,
  TemperatureLogTrigger.syncOnUpdate,
  TemperatureBreachTrigger.syncOnInsert,
  TemperatureBreachTrigger.syncOnUpdate,
];

// TODO: Maybe better to install these on migration rather than trying to install every trigger
// on app load.
export const installTriggers = async (dbService: DatabaseService): Promise<void> => {
  for (const trigger of triggers) {
    await trigger.install(dbService);
  }
};
