import { createConnection, getConnectionManager } from 'typeorm/browser';
import {
  SensorLog,
  TemperatureBreach,
  TemperatureBreachConfiguration,
  TemperatureLog,
  Sensor,
  Setting,
} from './entities';

const DEFAULT_DATABASE_CONFIG = {
  type: 'react-native',
  database: 'josh48.sqlite',
  location: 'default',

  // extra: {
  //   createFromLocation: '~josh.sqlite',
  // },
  logging: ['error', 'query', 'schema'],
  maxQueryExecutionTime: 3000,
  synchronize: true,
  entities: [
    Sensor,
    SensorLog,
    TemperatureLog,
    TemperatureBreach,
    TemperatureBreachConfiguration,
    Setting,
  ],
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
    const connectionManager = getConnectionManager();
    if (connectionManager.has('default')) return connectionManager.get('default');
    if (!this.connection) await this.createConnection();
    return this.connection;
  };

  getRepository = async repo => {
    return (await this.getConnection()).getRepository(repo);
  };
}
