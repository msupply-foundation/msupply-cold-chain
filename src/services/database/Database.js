import { createConnection, getRepository, getConnection } from 'typeorm/browser';
import {
  SensorLog,
  TemperatureBreach,
  TemperatureBreachConfiguration,
  TemperatureLog,
  Sensor,
} from '~entities';

const DEFAULT_DATABASE_CONFIG = {
  type: 'react-native',
  database: 'test4',
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
  }

  getConnection = async () => {
    try {
      return getConnection('default');
    } catch {
      return createConnection(this.config);
    }
  };

  getRepository = async repository => {
    return getRepository(repository);
  };
}
