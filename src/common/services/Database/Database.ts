import { Connection, ConnectionOptions, createConnection, getConnection } from 'typeorm/browser';
import {
  TemperatureBreach,
  TemperatureBreachConfiguration,
  TemperatureLog,
  Sensor,
  Setting,
  SyncLog,
} from './entities';

import { ENVIRONMENT } from '../../constants';

export const getDefaultDatabaseConfig = (): ConnectionOptions => ({
  type: 'react-native',
  database: 'josh47.sqlite',
  location: 'default',

  // extra: {
  //   createFromLocation: '~josh.sqlite',
  // },
  logging: ENVIRONMENT.QUERY_LOGGER ? ['error', 'query', 'schema'] : [],
  maxQueryExecutionTime: 300,
  // synchronize: true,
  entities: [
    Sensor,
    TemperatureLog,
    TemperatureBreach,
    TemperatureBreachConfiguration,
    Setting,
    SyncLog,
  ],
});

/**
 * Interface for connections to a database. If a previously created
 * connection exists, then return that connection. Otherwise, create
 * a new connection using the passed parameters.
 *
 * This is the only place where imports of database packages to initiate
 * a connection or to interface with any native module should occur.
 */
export class Database {
  config: ConnectionOptions;

  connection: Connection | null;

  constructor(config = getDefaultDatabaseConfig()) {
    this.config = config;
    this.connection = null;
  }

  createConnection = async (): Promise<Connection> => {
    try {
      this.connection = await getConnection('default');
      return this.connection;
    } catch (e) {
      this.connection = await createConnection(this.config);

      // Build schema from entity objects
      for (const entity of this.config.entities as any) {
        await this.connection.query((entity as any).getTableDefinition());
      }

      return this.connection;
    }
  };

  getConnection = async (): Promise<Connection | null> => {
    let conn = this.connection;
    if (!this.connection) {
      conn = await this.createConnection();
      // conn?.query('pragma journal_mode = "wal"');
      // conn?.query('pragma locking_mode = "exclusive"');
      // conn?.query('pragma synchronous=OFF');
      // conn?.query('pragma temp_store = "memory"');
    }

    return conn;
  };

  getRepository = async (repo: string): Promise<any | any[]> => {
    return (await this.getConnection())?.getRepository(repo);
  };
}
