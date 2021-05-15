import moment from 'moment';
import { Not, IsNull, MoreThan, Equal } from 'typeorm/browser';
import { ENTITIES } from '../../../common/constants';

export class ConsecutiveBreachManager {
  constructor(databaseService, utils) {
    this.databaseService = databaseService;
    this.utils = utils;
  }

  closeBreach = (temperatureBreach, time) => {
    // eslint-disable-next-line no-param-reassign
    temperatureBreach.endTimestamp = time;
    return temperatureBreach;
  };

  createBreach = (sensor, temperatureBreachConfiguration, startTimestamp) => {
    const { id: sensorId } = sensor;
    const { id: temperatureBreachConfigurationId } = temperatureBreachConfiguration;
    const id = this.utils.uuid();

    return {
      id,
      sensorId,
      temperatureBreachConfigurationId,
      temperatureBreachConfiguration,
      startTimestamp,
    };
  };

  willCreateBreach = (config, logs) => {
    if (!logs.length) return false;
    const { minimumTemperature, maximumTemperature, duration } = config;
    const { timestamp: endTimestamp } = logs[logs.length - 1];
    const { timestamp: startTimestamp } = logs[0];
    const logsDuration = endTimestamp - startTimestamp;
    if (logsDuration < duration / 1000) return false;
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
    if (!(breach && log)) return false;
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

  createBreaches = (sensor, logs, configs, breach) => {
    let stack = [];
    let currentBreach = breach;

    const breaches = breach && !breach.endTimestamp ? [breach] : [];
    const temperatureLogs = [];

    logs.forEach(log => {
      const couldBeInBreach = this.couldBeInBreach(log, configs);
      const willCloseBreach = this.willCloseBreach(currentBreach, log);
      const willContinueBreach = this.willContinueBreach(currentBreach, log);

      if (willCloseBreach) {
        this.closeBreach(currentBreach, log.timestamp);
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

    const updatedBreaches = breaches.map(
      ({ id, startTimestamp, endTimestamp, temperatureBreachConfigurationId, sensorId }) => ({
        id,
        startTimestamp,
        endTimestamp,
        temperatureBreachConfigurationId,
        sensorId,
      })
    );
    return [updatedBreaches, temperatureLogs];
  };

  getMostRecentBreach = async sensorId => {
    const [mostRecent] = await this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH, {
      where: { sensorId },
      order: { startTimestamp: 'DESC' },
      take: 1,
    });

    return mostRecent;
  };

  getMostRecentBreachLog = async sensorId => {
    const [mostRecentBreachLog] = await this.databaseService.queryWith(ENTITIES.TEMPERATURE_LOG, {
      where: { sensorId, temperatureBreachId: Not(IsNull()) },
      order: { timestamp: 'DESC' },
      take: 1,
    });

    return mostRecentBreachLog;
  };

  createBreachesFrom = async sensorId => {
    const { timestamp = moment(0).unix() } = (await this.getMostRecentBreachLog(sensorId)) ?? {};
    return timestamp;
  };

  getLogsToCheck = async sensorId => {
    const timeToCheckFrom = await this.createBreachesFrom(sensorId);

    return this.databaseService.queryWith(ENTITIES.TEMPERATURE_LOG, {
      where: { sensorId, timestamp: MoreThan(timeToCheckFrom) },
      order: { timestamp: 'ASC' },
    });
  };

  updateBreaches = async (breaches, temperatureLogs) => {
    const updatedBreaches = await this.databaseService.upsert(
      ENTITIES.TEMPERATURE_BREACH,
      breaches
    );

    const mapped = temperatureLogs.map(({ id, temperatureBreachId }) => ({
      id,
      temperatureBreachId,
    }));

    // TODO: SQLite playing funny bugger games when inserting with a FK straight after
    // creating with a FK
    await this.databaseService.updateMany(ENTITIES.TEMPERATURE_LOG, mapped);

    return [updatedBreaches, temperatureLogs];
  };

  getBreachConfigs = async () => {
    const configs = this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION, {
      where: [{ id: Equal('HOT_BREACH') }, { id: Equal('COLD_BREACH') }],
    });

    return configs;
  };
}
