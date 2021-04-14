import moment from "moment";

import { ENTITIES } from "../../common/constants";
import { DatabaseService } from "../../common/services/Database";
import { DevService } from '../../common/services/DevService';
import { Sensor, TemperatureBreachConfiguration, TemperatureLog } from "../../common/services/Database/entities";
import { UtilService } from "../../common/services/UtilService";

const DELETE_BREACH_LOGS = `
  DELETE FROM temperaturelog
  WHERE temperatureLog.timestamp <= ? AND temperatureLog.timestamp >= ?
`

class DevManager {
  databaseService: DatabaseService;
  utilService: UtilService;
  devService: DevService;

  constructor(databaseService: DatabaseService, utilService: UtilService, devService: DevService) {
    this.databaseService = databaseService;
    this.utilService = utilService;
    this.devService = devService;
  }

  generateSensor = () => {
    const macAddress = this.devService.randomMac();
    const logInterval = 300;
    const logDelay = 0;
    const batteryLevel = this.devService.randomInt(1, 100);

    return {
      macAddress,
      logInterval,
      logDelay,
      batteryLevel
    };
  };

  generateTemperatureLog = (sensor: Sensor, temperature: number, timestamp: number) => {
    const { id: sensorId, logInterval } = sensor;

    return {
      sensorId,
      logInterval,
      temperature,
      timestamp
    }
  }

  generateBreachTemperatureLog = (sensor: Sensor, temperatureBreachConfiguration: TemperatureBreachConfiguration, timestamp: number) => {
    const { id: sensorId, logInterval } = sensor;
   
    const temperature = this.devService.randomInt(
      temperatureBreachConfiguration.minimumTemperature, 
      temperatureBreachConfiguration.maximumTemperature
    );

    return {
      sensorId,
      logInterval,
      temperature,
      timestamp,
    }
  };

  generateBreachTemperatureLogs = async (sensor: Sensor) => {
    const { id: sensorId, logInterval } = sensor;
    const [{ minimumTemperature, maximumTemperature, duration }] = await this.databaseService.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION) as TemperatureBreachConfiguration[];

    const breachLogCount = Math.ceil(duration / (logInterval * 1000));
    const breachLogTimestamps = Array.from(Array(breachLogCount).keys()).reduce((acc, i) =>
      [...acc, moment.unix(acc[i]).subtract(logInterval, 'seconds').unix()], [moment().unix()]
    );

    return breachLogTimestamps.map(timestamp => {
      const id = this.utilService.uuid();
      const temperature = this.devService.randomInt(minimumTemperature, maximumTemperature);

      return {
        id,
        sensorId,
        logInterval,
        temperature,
        timestamp,
      };
    });
  }
}

export { DevManager }