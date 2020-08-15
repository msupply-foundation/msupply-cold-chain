import { createConnection } from 'typeorm/browser';
import {
  SensorLog,
  TemperatureBreach,
  TemperatureBreachConfiguration,
  TemperatureLog,
  Sensor,
} from '~entities';

const DEFAULT_DATABASE_CONFIG = {
  type: 'react-native',
  database: 'test34',
  location: 'default',
  logging: ['error', 'query', 'schema'],
  synchronize: true,
  entities: [Sensor, SensorLog, TemperatureLog, TemperatureBreach, TemperatureBreachConfiguration],
};

/**
 * Interface for connections to a database. If there is a connection ...
 * ... made already, then return that connection. Otherwise, create one
 * with the passed parameters.
 *
 * This is the only place where imports of database packages to initiate
 * a connection or to interface with any native module should occur.
 *
 */
export class Database {
  constructor(config = DEFAULT_DATABASE_CONFIG) {
    this.config = config;
    this.connection = null;
  }

  createConnection = async () => {
    this.connection = await createConnection(this.config);
    return this.connection;
  };

  getConnection = async () => {
    if (!this.connection) await this.createConnection();
    return this.connection;
  };

  getRepository = async repo => {
    return (await this.getConnection()).getRepository(repo);
  };
}
