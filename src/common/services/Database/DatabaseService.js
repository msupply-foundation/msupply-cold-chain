/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */

import _ from 'lodash';

import { ENTITIES, MILLISECONDS } from '~constants';

export class DatabaseService {
  constructor(database) {
    this.database = database;
  }

  init = async () => {
    const COLD_BREACH = {
      id: 'COLD_BREACH',
      minimumTemperature: -999,
      maximumTemperature: 2,
      duration: MILLISECONDS.ONE_MINUTE * 20,
      description: 'Cold breach',
    };

    const HOT_BREACH = {
      id: 'HOT_BREACH',
      minimumTemperature: 8,
      maximumTemperature: 999,
      duration: MILLISECONDS.ONE_MINUTE * 30,
      description: 'Hot breach',
    };

    const HOT_CUMULATIVE = {
      id: 'HOT_CUMULATIVE',
      minimumTemperature: 8,
      maximumTemperature: 999,
      duration: MILLISECONDS.ONE_MINUTE * 60,
      description: 'Hot cumulative',
    };

    const COLD_CUMULATIVE = {
      id: 'COLD_CUMULATIVE',
      minimumTemperature: -999,
      maximumTemperature: 2,
      duration: MILLISECONDS.ONE_MINUTE * 40,
      description: 'Cold cumulative',
    };

    const configs = await this.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);

    if (configs.length >= 4) return configs;

    return this.upsert(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION, [
      HOT_BREACH,
      HOT_CUMULATIVE,
      COLD_BREACH,
      COLD_CUMULATIVE,
    ]);
  };

  save = async (entityName, objectOrArray) => {
    const repository = await this.database.getRepository(entityName);
    return repository.save(objectOrArray);
  };

  delete = async (entityName, entities) => {
    const repository = await this.database.getRepository(entityName);
    return repository.remove(entities);
  };

  getAll = async entityName => {
    const repository = await this.database.getRepository(entityName);
    return repository.find();
  };

  upsert = async (entityName, object) => {
    let toSave = object;
    if (Array.isArray(object)) {
      toSave = _.chunk(object, 500);
      const results = await Promise.all(toSave.map(chunk => this.save(entityName, chunk)));
      return results.flat();
    }
    return this.save(entityName, object);
  };

  queryWith = async (entityName, queryObject) => {
    const repository = await this.database.getRepository(entityName);
    return repository.find(queryObject);
  };

  get = async (entityName, idOrQueryObject) => {
    const repository = await this.database.getRepository(entityName);
    return repository.findOne(idOrQueryObject);
  };

  query = async (entityName, query) => {
    const { manager } = await this.database.getConnection();
    return manager.query(entityName, query);
  };
}
