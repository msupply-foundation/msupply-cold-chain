import moment from 'moment';
import _ from 'lodash';
import { DATABASE_UTIL_ERROR } from '~constants';
import { uuid } from '../utilities';

export class DatabaseUtilsService {
  createSensorLogs = (logs, sensor, maxNumberToSave, timeNow = moment()) => {
    if (!(sensor && _.isPlainObject(sensor))) {
      throw new Error(DATABASE_UTIL_ERROR.CREATE_SENSOR_LOGS_WITH_NO_SENSOR);
    }

    if (!('id' in sensor && 'logInterval' in sensor)) {
      throw new Error(DATABASE_UTIL_ERROR.CREATE_SENSOR_LOGS_INVALID_SENSOR);
    }

    if (!(typeof maxNumberToSave === 'number' && maxNumberToSave >= 0)) {
      throw new Error(DATABASE_UTIL_ERROR.CREATE_SENSOR_LOGS_INVALID_NUMBER);
    }

    const { logInterval } = sensor;

    const sliceIndex = logs.length - maxNumberToSave;
    const logsToSave = logs.slice(sliceIndex);

    const initialTime = moment(timeNow);
    initialTime.subtract((logsToSave.length - 1) * logInterval, 'seconds');

    return this.mapLogs(logsToSave, initialTime, sensor);
  };

  mapLogs = (logs, startTimestamp, sensor) => {
    if (!(sensor && _.isPlainObject(sensor))) {
      throw new Error(DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_SENSOR);
    }

    if (!('id' in sensor && 'logInterval' in sensor)) {
      throw new Error(DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_SENSOR);
    }

    if (!moment(new Date(startTimestamp)).isValid()) {
      throw new Error(DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_TIMESTAMP);
    }

    if (!(logs && Array.isArray(logs))) {
      throw new Error(DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_LOGS);
    }

    const initial = moment(startTimestamp);
    const { id: sensorId, logInterval } = sensor;

    return logs.map(({ temperature }, i) => {
      if (!(typeof temperature === 'number')) {
        throw new Error(DATABASE_UTIL_ERROR.CREATE_SENSOR_LOGS_WITH_NO_TEMPERATURE);
      }

      const offset = logInterval * i;
      const timestamp = Number(moment(initial).add(offset, 's').format('x'));
      const id = uuid();

      return { id, sensorId, timestamp, temperature };
    });
  };

  // Calculates the number of sensor logs that should be saved from some given starting
  // point. Where the starting point is the timestamp for the next log.
  calculateNumberOfLogsToSave = (mostRecentLogTime, logInterval, timeNow = moment()) => {
    const now = moment(timeNow);
    const startingMoment = moment(mostRecentLogTime).add(logInterval, 's');

    if (!startingMoment.isValid()) {
      throw new Error(DATABASE_UTIL_ERROR.CALCULATE_NO_LOGS_INVALID_START_TIME);
    }

    if (!(logInterval && typeof logInterval === 'number')) {
      throw new Error(DATABASE_UTIL_ERROR.CALCULATE_NO_LOGS_INVALID_INTERVAL);
    }

    // If the time for the next log is in the future, then don't save any.
    if (startingMoment.isAfter(now)) return 0;

    // Calculate the seconds between the starting time and now.
    const secondsBetween = now.diff(startingMoment, 's', true);

    // For example, if there are 1 log interval between the starting time and now,
    // then the times are for example, 0955 and 1000 - so, we save both the 0955 log
    // and the 1000 log. If there was less than one log interval between, then the
    // times would be 0955 and 0957 - so we only save a single log, as the 1000 log
    // has not been recorded yet.
    return Math.floor(secondsBetween / logInterval) + 1;
  };
}
