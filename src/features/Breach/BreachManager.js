import moment from 'moment';
import { Not, IsNull, MoreThan, Equal } from 'typeorm/browser';

import { ENTITIES } from '~constants';

const CUMULATIVE_EXPOSURE = `
select *, sum(logInterval), max(temperature) maximumTemperature,
sum(logInterval) duration,
min(temperature) minimumTemperature,
case when min(temperature) >= hotCumulativeMinThreshold and sum(logInterval) * 1000 >= hotCumulativeDuration then 1 else 0 end as isHotCumulative,
case when max(temperature) <= coldCumulativeMaxThreshold and sum(logInterval) * 1000 >= coldCumulativeDuration then 1 else 0 end as isColdCumulative
from (
select temperature,
logInterval,
(select maximumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMaxThreshold,
(select minimumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMinThreshold,
(select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeDuration,
(select maximumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMaxThreshold,
(select minimumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMinThreshold,
(select duration from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeDuration
from temperaturelog
where ((temperature between hotCumulativeMinThreshold and hotCumulativeMaxThreshold) 
or (temperature between coldCumulativeMinThreshold and coldCumulativeMaxThreshold))
and (timestamp >= ? and timestamp <= ?)
and sensorId = ?
)
group by temperature >= hotCumulativeMinThreshold
`;

const REPORT = `
select (select "Continuous") "Breach Type",
tbc.description "Breach Name",
datetime(startTimestamp, "unixepoch", "localtime") "Start date",
coalesce(datetime(endTimestamp, "unixepoch", "localtime"), datetime("now", "localtime")) as "End date",
(coalesce(endTimestamp, strftime("%s", "now")) - startTimestamp) / 60 "Exposure Duration (minutes)",
max(temperature) as "Max Temp",
min(temperature) as "Min Temp"
from temperaturebreach tb
join temperaturelog tl on tl.temperatureBreachId = tb.id
join temperaturebreachconfiguration tbc on tbc.id = tb.temperatureBreachConfigurationId
where tb.sensorId = ?
group by tb.id
`;

export class BreachManager {
  constructor(databaseService, utils) {
    this.databaseService = databaseService;
    this.utils = utils;
  }

  getAll = async () => {
    return this.databaseService.getAll(ENTITIES.TEMPERATURE_BREACH);
  };

  getLogsForBreach = async breachId => {
    return this.databaseService.queryWith(ENTITIES.TEMPERATURE_LOG, {
      temperatureBreachId: breachId,
    });
  };

  getCumulativeExposure = async (from, to, sensorId) => {
    const manager = await this.databaseService.getEntityManager();
    const result = await manager.query(CUMULATIVE_EXPOSURE, [from, to, sensorId]);

    const lookup = result.reduce((acc, value) => {
      if (value.isHotCumulative) return { ...acc, hotCumulative: value };
      if (value.isColdCumulative) return { ...acc, coldCumulative: value };
      return acc;
    }, {});

    return lookup;
  };

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
    // eslint-disable-next-line no-param-reassign

    const updatedBreaches = await this.databaseService.upsert(
      ENTITIES.TEMPERATURE_BREACH,
      breaches
    );

    const mapped = temperatureLogs.map(({ id, temperature, timestamp }) => ({
      id,
      temperature,
      timestamp,
    }));

    // TODO: SQLite playing funny bugger games when inserting with a FK straight after
    // creating with a FK
    await this.databaseService.upsert(ENTITIES.TEMPERATURE_LOG, mapped);
    const updatedLogs = await this.databaseService.upsert(
      ENTITIES.TEMPERATURE_LOG,
      temperatureLogs
    );

    return [updatedBreaches, updatedLogs];
  };

  getBreachConfigs = async () => {
    const configs = this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION, {
      where: [{ id: Equal('HOT_BREACH') }, { id: Equal('COLD_BREACH') }],
    });

    return configs;
  };

  getBreachReport = async id => {
    const manager = await this.databaseService.getEntityManager();
    return manager.query(REPORT, [id]);
  };
}
