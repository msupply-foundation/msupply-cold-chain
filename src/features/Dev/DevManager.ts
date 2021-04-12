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

  generateBreachLogs = async (sensor: Sensor) => {
    const { id: sensorId, logInterval } = sensor;
    const [{ minimumTemperature, maximumTemperature, duration }] = await this.databaseService.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION) as TemperatureBreachConfiguration[];

    const breachLogCount = Math.ceil(duration / (logInterval * 1000));
    const breachLogTimestamps = Array.from(Array(breachLogCount).keys()).reduce((acc, i) =>
      [...acc, moment.unix(acc[i]).subtract(logInterval, 'seconds').unix()], [moment().unix()]
    );

    const breachLogs = breachLogTimestamps.map(timestamp => {
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

    try {
      await this.databaseService.query(DELETE_BREACH_LOGS, [breachLogTimestamps[0], breachLogTimestamps[breachLogCount-1]]);
      await Promise.all(breachLogs.map(async breachLog => this.databaseService.upsert(ENTITIES.TEMPERATURE_LOG, breachLog)));
    } catch (err) {
      // TODO: add better error handling.
      console.log(err.message);
    }
  }
}

export { DevManager }