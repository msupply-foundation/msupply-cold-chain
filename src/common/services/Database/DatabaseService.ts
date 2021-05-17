import _ from 'lodash';
import { EntitySubscriberInterface } from 'typeorm/browser';
import { Database } from './Database';
import { ENTITIES, MILLISECONDS } from '~constants';
import { classToPlain } from 'class-transformer';
import { migrations } from '~common/services/Database/migrations';

export class DatabaseService {
  database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  init = async (): Promise<any> => {
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

    if (configs.length !== 4) {
      await this.upsert(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION, [
        HOT_BREACH,
        HOT_CUMULATIVE,
        COLD_BREACH,
        COLD_CUMULATIVE,
      ]);
    }

    const isIntegrating = await this.get(ENTITIES.SETTING, { key: 'isIntegrating' });
    if (!isIntegrating) {
      await this.upsert(ENTITIES.SETTING, {
        id: 'isIntegrating',
        key: 'isIntegrating',
        value: 'false',
      });
    }

    const lastSync = await this.get(ENTITIES.SETTING, {
      key: 'lastSync',
    });
    if (!lastSync) {
      await this.upsert(ENTITIES.SETTING, {
        id: 'lastSync',
        key: 'lastSync',
        value: '0',
      });
    }

    const defaultLogInterval = await this.get(ENTITIES.SETTING, {
      key: 'defaultLogInterval',
    });

    if (!defaultLogInterval) {
      await this.upsert(ENTITIES.SETTING, {
        id: 'defaultLogInterval',
        key: 'defaultLogInterval',
        value: '300',
      });
    }

    for (const migration of migrations) {
      await migration.migrate(this);
    }
  };

  transaction = async (callback: () => Promise<void>): Promise<void> => {
    const connection = await this.database.getConnection();

    if (!connection) throw new Error('Database is not connected!');

    const queryRunner = await connection.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      await callback();
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  };

  registerSubscribers = (subscribers: EntitySubscriberInterface[]): void => {
    subscribers.forEach(subscriber => this.database.connection?.subscribers.push(subscriber));
  };

  update = async (entityName: string, id: string, object: any): Promise<any | any[]> => {
    const repository = await this.database.getRepository(entityName);
    return repository.update(id, object);
  };

  insert = async (entityName: string, objectOrArray: any | any[]): Promise<any | any[]> => {
    if (Array.isArray(objectOrArray)) {
      const repository = await this.database.getRepository(entityName);
      const chunks = _.chunk(objectOrArray, 100);
      return Promise.all(chunks.map(chunk => repository.insert(chunk)));
    }
    const repository = await this.database.getRepository(entityName);
    return repository.insert(objectOrArray);
  };

  save = async (entityName: string, objectOrArray: any | any[]): Promise<any | any[]> => {
    const repository = await this.database.getRepository(entityName);
    return repository.save(objectOrArray);
  };

  getAll = async (entityName: string): Promise<any | any[]> => {
    const repository = await this.database.getRepository(entityName);
    return repository
      .find()
      .then((result: any) => result.map((entity: any) => classToPlain(entity)));
  };

  upsert = async (entityName: string, object: any): Promise<any | any[]> => {
    let toSave = object;
    if (Array.isArray(object)) {
      toSave = _.chunk(object, 500) as any[];
      const results = (await Promise.all(
        toSave.map((chunk: any) => this.save(entityName, chunk))
      )) as any[];
      return results.flat();
    }
    return this.save(entityName, object);
  };

  queryWith = async (entityName: string, queryObject: any): Promise<any | any[]> => {
    const repository = await this.database.getRepository(entityName);
    return repository.find(queryObject);
  };

  get = async (entityName: string, idOrQueryObject: string | any): Promise<any | any[]> => {
    const repository = await this.database.getRepository(entityName);
    return repository.findOne(idOrQueryObject);
  };

  query = async (entityName: string, query?: (string | number)[]): Promise<any | any[]> => {
    const { manager } = (await this.database.getConnection()) ?? {};
    return manager?.query(entityName, query) ?? null;
  };
}
