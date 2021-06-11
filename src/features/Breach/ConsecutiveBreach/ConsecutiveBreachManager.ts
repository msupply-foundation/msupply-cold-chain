import {
  TemperatureBreach,
  TemperatureBreachConfiguration,
  TemperatureLog,
} from '~services/Database/entities';
import { UtilService } from '~services/UtilService';
import { DatabaseService, Sensor } from '~services/Database';
import { Not, IsNull, MoreThan, Equal } from 'typeorm/browser';
import { SensorLog } from '~services/Bluetooth/types';
import { ENTITIES } from '~constants';

export class ConsecutiveBreachManager {
  databaseService: DatabaseService;

  utils: UtilService;

  constructor(databaseService: DatabaseService, utils: UtilService) {
    this.databaseService = databaseService;
    this.utils = utils;
  }

  closeBreach = (
    temperatureBreach: Partial<TemperatureBreach>,
    time: number
  ): Partial<TemperatureBreach> => {
    temperatureBreach.endTimestamp = time;
    return temperatureBreach;
  };

  createBreach = (
    sensor: Sensor,
    temperatureBreachConfiguration: TemperatureBreachConfiguration,
    startTimestamp: number
  ): Partial<TemperatureBreach> => {
    const { id: sensorId } = sensor;
    const { id: temperatureBreachConfigurationId } = temperatureBreachConfiguration;
    const id = this.utils.uuid();

    return {
      id,
      sensorId,
      temperatureBreachConfigurationId,
      temperatureBreachConfiguration,
      startTimestamp,
      acknowledged: false,
    };
  };

  willCreateBreach = (config: TemperatureBreachConfiguration, logs: TemperatureLog[]): boolean => {
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

  willCreateBreachFromConfigs = (
    configs: TemperatureBreachConfiguration[],
    logs: TemperatureLog[]
  ): [boolean, TemperatureBreachConfiguration] | [boolean, undefined] => {
    const configToCreateBreachFrom = configs.find(config => this.willCreateBreach(config, logs));
    return [!!configToCreateBreachFrom, configToCreateBreachFrom];
  };

  addLogToBreach = (breach: Partial<TemperatureBreach>, log: TemperatureLog): TemperatureLog => {
    const { id: temperatureBreachId = '' } = breach;
    return { ...log, temperatureBreachId };
  };

  willContinueBreach = (breach: Partial<TemperatureBreach>, log: TemperatureLog): boolean => {
    if (!breach) return false;

    const { temperatureBreachConfiguration } = breach;
    const { maximumTemperature = 0, minimumTemperature = 0 } = temperatureBreachConfiguration ?? {};
    const { temperature } = log;

    return temperature >= minimumTemperature && temperature <= maximumTemperature;
  };

  willCloseBreach = (breach: Partial<TemperatureBreach>, log: TemperatureLog): boolean => {
    if (!(breach && log)) return false;

    const { temperatureBreachConfiguration } = breach;
    const { maximumTemperature = 0, minimumTemperature = 0 } = temperatureBreachConfiguration ?? {};
    const { temperature } = log;

    return !(temperature >= minimumTemperature && temperature <= maximumTemperature);
  };

  couldBeInBreach = (log: SensorLog, configs: TemperatureBreachConfiguration[]): boolean => {
    return configs.some(
      config =>
        log.temperature >= config.minimumTemperature && log.temperature <= config.maximumTemperature
    );
  };

  createBreaches = (
    sensor: Sensor,
    logs: TemperatureLog[],
    configs: TemperatureBreachConfiguration[],
    breach?: TemperatureBreach
  ): [Partial<TemperatureBreach>[], TemperatureLog[]] => {
    let stack: TemperatureLog[] = [];
    let currentBreach: null | undefined | Partial<TemperatureBreach> = breach;

    const breaches = currentBreach && !currentBreach.endTimestamp ? [currentBreach] : [];
    const temperatureLogs: TemperatureLog[] = [];

    logs.forEach(log => {
      const couldBeInBreach = this.couldBeInBreach(log, configs);
      const willCloseBreach = currentBreach ? this.willCloseBreach(currentBreach, log) : false;
      const willContinueBreach = currentBreach
        ? this.willContinueBreach(currentBreach, log)
        : false;

      if (willCloseBreach) {
        if (currentBreach) {
          this.closeBreach(currentBreach, log.timestamp);
          currentBreach = null;
        }

        stack = [];
      }

      if (couldBeInBreach) stack.push(log);
      else stack = [];

      if (willContinueBreach && currentBreach) {
        const updatedLog = this.addLogToBreach(currentBreach, log);
        temperatureLogs.push(updatedLog);
      }

      if (!willContinueBreach) {
        const [willCreateBreach, config] = this.willCreateBreachFromConfigs(configs, stack);
        if (willCreateBreach && config) {
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

  getMostRecentBreach = async (sensorId: string): Promise<number> => {
    const [mostRecent] = await this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH, {
      where: { sensorId },
      order: { startTimestamp: 'DESC' },
      take: 1,
    });

    return mostRecent;
  };

  getMostRecentBreachLog = async (sensorId: string): Promise<TemperatureLog | undefined> => {
    const [mostRecentBreachLog] = await this.databaseService.queryWith(ENTITIES.TEMPERATURE_LOG, {
      where: { sensorId, temperatureBreachId: Not(IsNull()) },
      order: { timestamp: 'DESC' },
      take: 1,
    });

    return mostRecentBreachLog;
  };

  createBreachesFrom = async (sensorId: string): Promise<number> => {
    const { timestamp = this.utils.now() } = (await this.getMostRecentBreachLog(sensorId)) ?? {};
    return timestamp;
  };

  getLogsToCheck = async (sensorId: string): Promise<TemperatureLog[]> => {
    const timeToCheckFrom = await this.createBreachesFrom(sensorId);

    return this.databaseService.queryWith(ENTITIES.TEMPERATURE_LOG, {
      where: { sensorId, timestamp: MoreThan(timeToCheckFrom) },
      order: { timestamp: 'ASC' },
    });
  };

  updateBreaches = async (
    breaches: TemperatureBreach[],
    temperatureLogs: TemperatureLog[]
  ): Promise<[TemperatureBreach[], TemperatureLog[]]> => {
    const updatedBreaches = await this.databaseService.upsert(
      ENTITIES.TEMPERATURE_BREACH,
      breaches
    );

    const mapped = temperatureLogs.map(({ id, temperatureBreachId }) => ({
      id,
      temperatureBreachId,
    }));

    await this.databaseService.updateMany(ENTITIES.TEMPERATURE_LOG, mapped);

    return [updatedBreaches, temperatureLogs];
  };

  getBreachConfigs = async (): Promise<TemperatureBreachConfiguration[]> => {
    const configs = this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION, {
      where: [{ id: Equal('HOT_BREACH') }, { id: Equal('COLD_BREACH') }],
    });

    return configs;
  };
}
