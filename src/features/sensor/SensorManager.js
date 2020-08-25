import { ENTITIES } from '~constants';
import { uuid } from '~services/utilities';

export class SensorManager {
  constructor(dbService) {
    this.databaseService = dbService;
  }

  upsert = async (...params) => {
    return this.databaseService.upsert(ENTITIES.SENSOR, ...params);
  };

  getSensors = async () => {
    return this.databaseService.getAll(ENTITIES.SENSOR);
  };

  getTemperatureBreachConfigs = async () => {
    return this.databaseService.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);
  };

  // eslint-disable-next-line class-methods-use-this
  createBreachConfigurationJoinRecord = async (sensor, temperatureBreachConfiguration) => {
    const id = uuid();
    const joinRecord = {
      id,
      sensorId: sensor.id,
      breachConfigurationId: temperatureBreachConfiguration.id,
    };

    return joinRecord;
  };

  addNewSensor = async (macAddress, logInterval) => {
    const id = uuid();
    return this.upsert({ logInterval, macAddress, id });
  };

  updateField = async (id, key, value) => {
    return this.upsert({ id, [key]: value });
  };

  updateName = async (id, name) => {
    return this.upsert({ id, name });
  };

  updateLogDelay = async (id, logDelay) => {
    return this.upsert({ id, logDelay });
  };

  updateLogInterval = async (id, logInterval) => {
    return this.upsert({ id, logInterval });
  };
}
