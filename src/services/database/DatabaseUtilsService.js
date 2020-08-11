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
    const startingMoment = moment(mostRecentLogTime ?? 0).add(logInterval, 's');

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

  // Pass a bunch of sensor logs and a chunk size
  createTemperatureLogs = (logs, logsPerTemperatureLog) => {
    if (!Array.isArray(logs)) {
      throw new Error(DATABASE_UTIL_ERROR.CREATE_TEMPERATURE_LOGS_INVALID_LOGS);
    }

    if (!(typeof logsPerTemperatureLog === 'number' && logsPerTemperatureLog >= 0)) {
      throw new Error(DATABASE_UTIL_ERROR.CREATE_TEMPERATURE_LOGS_INVALID_NUMBER);
    }

    const { length: numberOfLogs } = logs;

    const leftoverIndex = numberOfLogs - (numberOfLogs % logsPerTemperatureLog);
    const withoutLeftovers = logs.slice(0, leftoverIndex);

    const chunked = _.chunk(withoutLeftovers, logsPerTemperatureLog);

    return chunked.map(sensorLogs => {
      const temperatureLog = this.aggregateSensorLogs(sensorLogs);
      return { temperatureLog, sensorLogs };
    });
  };

  // Calculates the number of sensor logs per temp log
  calculateSensorLogsPerTemperatureLog = (logInterval, temperatureLogSize) => {
    if (typeof logInterval !== 'number' || typeof temperatureLogSize !== 'number') {
      throw new Error(DATABASE_UTIL_ERROR.CALCULATE_TEMPERATURE_LOG_SIZE_INVALID_NUMBER);
    }

    if (!temperatureLogSize || temperatureLogSize < 0 || logInterval < 0) {
      throw new Error(DATABASE_UTIL_ERROR.CALCULATE_TEMPERATURE_LOG_SIZE_INVALID_NUMBER);
    }

    return Math.floor(Math.round(temperatureLogSize) / (Math.round(logInterval) * 1000));
  };

  // Transforms a set of sensor logs into an aggregated log.
  aggregateSensorLogs = sensorLogs => {
    if (!Array.isArray(sensorLogs)) {
      throw new Error(DATABASE_UTIL_ERROR.AGGREGATE_SENSOR_LOGS_INVALID_LOGS);
    }

    if (!sensorLogs.length) return null;

    const commonSensorId = sensorLogs.reduce((value, { sensorId }) => {
      if ((value && sensorId && sensorId !== value) || !sensorId) {
        throw new Error(DATABASE_UTIL_ERROR.AGGREGATE_SENSOR_LOGS_INVALID_SENSOR_ID);
      }

      return sensorId;
    }, '');
    const averageTemperature =
      sensorLogs.reduce((sum, { temperature }) => {
        if (typeof temperature !== 'number') {
          throw new Error(DATABASE_UTIL_ERROR.AGGREGATE_SENSOR_LOGS_NO_TEMPERATURE);
        }

        return temperature + sum;
      }, 0) / sensorLogs.length;

    const minimumTimestamp = sensorLogs.reduce((sum, { timestamp }) => {
      if (typeof timestamp !== 'number') {
        throw new Error(DATABASE_UTIL_ERROR.AGGREGATE_SENSOR_LOGS_NO_TIMESTAMP);
      }

      return Math.min(sum, timestamp);
    }, Number.MAX_SAFE_INTEGER);

    const id = uuid();

    return {
      id,
      sensorId: commonSensorId,
      temperature: averageTemperature,
      timestamp: minimumTimestamp,
    };
  };

  closeBreach = (temperatureBreach, time) => {
    if (!(temperatureBreach && _.isObject(temperatureBreach))) {
      throw new Error(DATABASE_UTIL_ERROR.CLOSE_BREACH_INVALID_BREACH);
    }

    if (temperatureBreach.endTimestamp) {
      throw new Error(DATABASE_UTIL_ERROR.CLOSE_BREACH_HAS_END_TIME);
    }

    // eslint-disable-next-line no-param-reassign
    temperatureBreach.endTimestamp = time;
    return temperatureBreach;
  };

  createBreach = (sensor, temperatureBreachConfiguration, startTimestamp) => {
    if (!sensor?.id) throw new Error(DATABASE_UTIL_ERROR.CREATE_BREACH_INVALID_SENSOR);
    if (!temperatureBreachConfiguration?.id) {
      throw new Error(DATABASE_UTIL_ERROR.CREATE_BREACH_INVALID_CONFIG);
    }

    const { id: sensorId } = sensor;
    const { id: temperatureBreachConfigurationId } = temperatureBreachConfiguration;
    const id = uuid();

    return {
      id,
      sensorId,
      temperatureBreachConfigurationId,
      temperatureBreachConfiguration,
      startTimestamp,
    };
  };

  willCreateBreach = (config, logs) => {
    if (
      _.isNil(config?.minimumTemperature) ||
      _.isNil(config?.maximumTemperature) ||
      _.isNil(config?.duration)
    ) {
      throw new Error(DATABASE_UTIL_ERROR.WILL_CREATE_BREACH_INVALID_CONFIG);
    }

    if (!Array.isArray(logs)) {
      throw new Error(DATABASE_UTIL_ERROR.WILL_CREATE_BREACH_INVALID_LOGS);
    }

    logs.forEach(log => {
      if (_.isNil(log?.temperature) || _.isNil(log?.timestamp)) {
        throw new Error(DATABASE_UTIL_ERROR.WILL_CREATE_BREACH_INVALID_LOG);
      }
    });

    if (!logs.length) return false;

    const { minimumTemperature, maximumTemperature, duration } = config;

    const { timestamp: endTimestamp } = logs[logs.length - 1];
    const { timestamp: startTimestamp } = logs[0];
    const logsDuration = endTimestamp - startTimestamp;

    if (logsDuration < duration) return false;

    const temperaturesWithinBounds = logs.every(log => {
      const { temperature } = log;

      return temperature <= maximumTemperature && temperature >= minimumTemperature;
    });

    return temperaturesWithinBounds;
  };

  willCreateBreachFromConfigs = (configs, logs) => {
    const configToCreateBreachFrom = configs.find(config => this.willCreateBreach(config, logs));

    return [!!configToCreateBreachFrom, configToCreateBreachFrom];
  };

  addLogToBreach = (breach, log) => {
    if (_.isNil(breach?.id)) {
      throw new Error(DATABASE_UTIL_ERROR.ADD_LOG_TO_BREACH_INVALID_BREACH);
    }

    if (!_.isNil(log?.temperatureBreachId)) {
      throw new Error(DATABASE_UTIL_ERROR.ADD_LOG_TO_BREACH_LOG_ALREADY_BREACHED);
    }

    const { id: temperatureBreachId } = breach;

    return { ...log, temperatureBreachId };
  };

  willContinueBreach = (breach, log) => {
    if (!breach) return false;

    const { temperatureBreachConfiguration } = breach;
    const { maximumTemperature, minimumTemperature } = temperatureBreachConfiguration;

    const { temperature } = log;

    return temperature >= minimumTemperature && temperature <= maximumTemperature;
  };

  willCloseBreach = (breach, log) => {
    if (!breach || !log) return false;

    const { temperatureBreachConfiguration } = breach;
    const { maximumTemperature, minimumTemperature } = temperatureBreachConfiguration;

    const { temperature } = log;

    return !(temperature >= minimumTemperature && temperature <= maximumTemperature);
  };

  couldBeInBreach = (log, configs) => {
    return configs.some(
      config =>
        log.temperature >= config.minimumTemperature && log.temperature <= config.maximumTemperature
    );
  };

  cBreaches = (sensor, logs, configs, breach) => {
    let stack = [];
    let currentBreach = breach;

    const breaches = [];
    const temperatureLogs = [];

    logs.forEach(log => {
      const couldBeInBreach = this.couldBeInBreach(log, configs);
      const willCloseBreach = this.willCloseBreach(currentBreach, log);
      const willContinueBreach = this.willContinueBreach(currentBreach, log);

      if (willCloseBreach) {
        this.closeBreach(currentBreach, stack[stack.length - 1]?.timestamp);
        currentBreach = null;
        stack = [];
      }

      if (couldBeInBreach) stack.push(log);
      else stack = [];

      if (willContinueBreach) {
        const updatedLog = this.addLogToBreach(currentBreach, log);
        temperatureLogs.push(updatedLog);
      }

      if (!willContinueBreach) {
        const [willCreateBreach, config] = this.willCreateBreachFromConfigs(configs, stack);
        if (willCreateBreach) {
          const newBreach = this.createBreach(sensor, config, stack[0].timestamp);
          currentBreach = newBreach;
          breaches.push(newBreach);
          const updatedLogs = stack.map(l => this.addLogToBreach(newBreach, l));
          updatedLogs.forEach(ul => temperatureLogs.push(ul));
        }
      }
    });

    return [breaches, temperatureLogs];
  };
}
