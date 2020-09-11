/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import moment from 'moment';
import _ from 'lodash';
import { Equal, IsNull, Not, Between } from 'typeorm/browser';

import { ENTITIES } from '~constants';

export class DatabaseService {
  constructor(database) {
    this.database = database;
  }

  delete = async (entityName, entities) => {
    const repository = await this.database.getRepository(entityName);
    return repository.remove(entities);
  };

  getAll = async entityName => {
    const connection = await this.database.getConnection();
    const repository = await connection.getRepository(entityName);
    return repository.find();
  };

  upsert = async (entityName, object) => {
    const repository = await this.database.getRepository(entityName);

    let toSave = object;
    if (Array.isArray(object)) {
      toSave = _.chunk(object, 500);
      const results = await Promise.all(toSave.map(chunk => repository.save(chunk)));
      return results.flat();
    }
    return repository.save(object);
  };

  queryWith = async (entityName, queryObject) => {
    const repository = await this.database.getRepository(entityName);
    return repository.find(queryObject);
  };

  get = async (entityName, id) => {
    const repository = await this.database.getRepository(entityName);
    return repository.findOne(id);
  };

  getWith = async (entityName, queryObject) => {
    const repository = await this.database.getRepository(entityName);
    return repository.findOne(queryObject);
  };

  getQueryBuilder = async (entityName, alias) => {
    const repository = await this.database.getRepository(entityName);
    return repository.createQueryBuilder(alias);
  };

  getEntityManager = async () => {
    return (await this.database.getConnection()).manager;
  };

  getSensors = async () => {
    return this.getAll(ENTITIES.SENSOR);
  };

  getSensor = async macAddress => {
    return this.queryWith(ENTITIES.SENSOR, { macAddress });
  };

  saveSensors = async sensors => {
    const macAddresses = sensors.map(({ macAddress }) => ({ macAddress }));
    const sensorEntities = await this.queryWith(ENTITIES.SENSOR, macAddresses);

    const updatedEntities = sensors.map(entity => {
      const { macAddress: entityMacAddress } = entity;
      const oldValues = sensorEntities.find(({ macAddress }) => macAddress === entityMacAddress);
      return { ...oldValues, ...entity };
    });

    return this.upsert(ENTITIES.SENSOR, updatedEntities);
  };

  mostRecentTimestamp = async sensor => {
    const { id } = sensor;
    const sensorQueryBuilder = await this.getQueryBuilder(ENTITIES.SENSOR, 's');

    const { mostRecentTemperatureLogTimestamp } = await sensorQueryBuilder
      .select('max(tl.timestamp)', 'mostRecentTemperatureLogTimestamp')
      .where('s.id = :id', { id })
      .leftJoinAndMapMany('tl.timestamp', 's.temperatureLogs', 'tl')
      .getRawOne();

    const { mostRecentSensorLogTimestamp } = await sensorQueryBuilder
      .select('max(sl.timestamp)', 'mostRecentSensorLogTimestamp')
      .where('s.id = :id', { id })
      .leftJoinAndMapMany('sl.timestamp', 's.sensorLogs', 'sl')
      .getRawOne();

    if (!mostRecentSensorLogTimestamp) return mostRecentTemperatureLogTimestamp;
    if (!mostRecentTemperatureLogTimestamp) return mostRecentSensorLogTimestamp;

    return moment(mostRecentSensorLogTimestamp).isAfter(moment(mostRecentTemperatureLogTimestamp))
      ? mostRecentSensorLogTimestamp
      : mostRecentTemperatureLogTimestamp;
  };

  saveSensorLogs = async logsToSave => {
    const chunks = _.chunk(logsToSave, 100);
    const promises = chunks.map(chunk => this.upsert(ENTITIES.SENSOR_LOG, chunk));
    const savedLogs = await Promise.all(promises);
    return savedLogs.reduce((acc, value) => [...acc, ...value], []);
  };

  getTemperatureLogs = async (sensor, fromDate = new Date(null), toDate = new Date()) => {
    const { id: sensorId } = sensor;
    return this.queryWith(ENTITIES.TEMPERATURE_LOG, {
      where: [
        { sensorId: Equal(sensorId), timestamp: Between(fromDate.getTime(), toDate.getTime()) },
        // { timestamp: MoreThanOrEqual(fromDate.getTime()) },
        // { timestamp: LessThanOrEqual(toDate.getTime()) },
      ],
      order: {
        timestamp: 'ASC',
      },
    });
  };

  getMostRecentBreachedLog = async sensor => {
    const { id: sensorId } = sensor;
    const temperatureLogs = await this.queryWith(ENTITIES.TEMPERATURE_LOG, {
      where: [{ temperatureBreachId: Not(IsNull()), sensorId }],
      order: { timestamp: 'DESC' },
    });

    if (temperatureLogs.length) {
      const { timestamp } = temperatureLogs[0];

      return timestamp;
    }

    return new Date(null).getTime();
  };

  getMostRecentBreach = async sensor => {
    const { id: sensorId } = sensor;

    const b = this.queryWith(ENTITIES.TEMPERATURE_BREACH, {
      sensorId,
      order: { startTimestamp: 'desc' },
      take: 1,
    });

    return b?.[0] ?? null;
  };

  getConfigs = async () => {
    return this.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);
  };

  createBreaches = async macAddress => {
    const [sensor] = await this.getSensor(macAddress);

    const breachesCreated = [];
    const breachesEnded = [];

    const { id: sensorId } = sensor;

    const [mostRecentBreach] = await this.queryWith('TemperatureBreach', {
      order: { startTimestamp: 'DESC' },
      where: { sensorId },
    });

    const startingTimestamp = mostRecentBreach?.endTimestamp
      ? mostRecentBreach.endTimestamp
      : mostRecentBreach?.startTimestamp || new Date(null).getTime();

    const temperatureLogs = await this.getTemperatureLogs(sensor, startingTimestamp + 1);

    for (let i = 0; i < temperatureLogs.length; i += 1) {
      const [mostRecentSensorBreach] = (
        await (await this.getQueryBuilder(ENTITIES.TEMPERATURE_BREACH, 'tb'))
          .leftJoinAndSelect('tb.temperatureBreachConfiguration', 'config')
          .where('endTimestamp IS NULL AND sensorId = :sensorId', { sensorId })
          .execute()
      ).map(({ tb_id, config_maximumTemperature, config_minimumTemperature }) => ({
        id: tb_id,
        maximumTemperature: config_maximumTemperature,
        minimumTemperature: config_minimumTemperature,
      }));

      if (mostRecentSensorBreach) {
        const {
          maximumTemperature,
          minimumTemperature,
          id: temperatureBreachId,
        } = mostRecentSensorBreach;

        const { temperature, timestamp } = temperatureLogs[i];

        const willContinueBreach =
          temperature >= minimumTemperature && temperature <= maximumTemperature;

        if (willContinueBreach) {
          await this.upsert(ENTITIES.TEMPERATURE_LOG, {
            id: temperatureLogs[i].id,
            temperatureBreachId,
          });
        } else {
          const breach = await this.upsert(ENTITIES.TEMPERATURE_BREACH, {
            ...mostRecentSensorBreach,
            endTimestamp: timestamp,
          });
          breachesEnded.push(breach);
        }
      } else {
        const configs = await this.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);

        for (let j = 0; j < configs.length; j += 1) {
          const { timestamp } = temperatureLogs[i];
          const { maximumTemperature, minimumTemperature, duration, id: configId } = configs[j];

          const lookback = timestamp - duration;

          const logs = (
            await (await this.getQueryBuilder(ENTITIES.TEMPERATURE_LOG, 'tl'))
              .where('tl.timestamp >= :lookback AND tl.timestamp <= :timestamp', {
                maximumTemperature,
                minimumTemperature,
                lookback,
                timestamp,
              })
              .execute()
          ).map(({ tl_id, tl_sensorId, tl_temperature, tl_timestamp, tl_temperatureBreachId }) => ({
            id: tl_id,
            sensorId: tl_sensorId,
            timestamp: tl_timestamp,
            temperature: tl_temperature,
            temperatureBreachId: tl_temperatureBreachId,
          }));

          const aboveTemp = logs.every(log => {
            return (
              log.temperature > minimumTemperature &&
              log.temperature < maximumTemperature &&
              !log.temperatureBreachId
            );
          });

          if (logs.length > 0 && aboveTemp) {
            const startTimestamp = logs[0].timestamp;
            const endTimestamp = logs[logs.length - 1].timestamp;

            if (endTimestamp - startTimestamp >= duration) {
              const result = await this.createBreach(startTimestamp, sensorId, configId, logs);
              breachesCreated.push(result);
            }
          }
        }
      }
    }

    return { breachesCreated, breachesEnded };
  };

  createBreach = async (startTimestamp, sensorId, temperatureBreachConfigurationId, logs) => {
    const newBreach = { startTimestamp, sensorId, temperatureBreachConfigurationId };
    const newBreachRecord = await this.upsert(ENTITIES.TEMPERATURE_BREACH, newBreach);

    const { id: temperatureBreachId } = newBreachRecord;
    const mappedLogs = logs.map(log => ({ ...log, temperatureBreachId }));

    return this.upsert(ENTITIES.TEMPERATURE_LOG, mappedLogs);
  };

  updateBreaches = async (breaches, temperatureLogs) => {
    // eslint-disable-next-line no-param-reassign
    breaches.forEach(p => delete p.temperatureBreachConfiguration);
    const updatedBreaches = await this.upsert(ENTITIES.TEMPERATURE_BREACH, breaches);

    const l = temperatureLogs.map(poi => ({
      id: poi.id,
      temperature: poi.temperature,
      timestamp: poi.timestamp,
    }));

    await this.upsert(ENTITIES.TEMPERATURE_LOG, l);
    const logs2 = await this.upsert(ENTITIES.TEMPERATURE_LOG, temperatureLogs);

    return [updatedBreaches, logs2];
  };
}
