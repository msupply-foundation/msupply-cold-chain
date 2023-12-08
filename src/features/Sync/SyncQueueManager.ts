import { TemperatureLog } from '~services/Database/entities';
import { Sensor, TemperatureBreach } from '~common/services/Database/entities';
import _ from 'lodash';
import { In } from 'typeorm/browser';
import { ENTITIES } from '../../common/constants';
import { DatabaseService } from '../../common/services';
import { SyncLog } from '../../common/services/Database/entities';
import { Syncable } from '~features/Sync/types';

const SYNC_QUEUE_PEEK_NEXT = `
    SELECT * FROM synclog
    WHERE type = ? 
    ORDER BY timestamp
    LIMIT ?
`;

const SYNC_QUEUE_DROP = `
  DELETE FROM synclog
  WHERE id IN (?)
`;

const SYNC_QUEUE_LENGTH = `
  SELECT COUNT(*) as count FROM synclog
`;

const SYNC_QUEUE_LENGTH_FOR_TYPE = `
  SELECT COUNT(*) as count FROM synclog
  WHERE type = ?
`;

class SyncQueueManager {
  private databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  nextSyncLogs = async (entity: string, count = 100): Promise<SyncLog[]> => {
    return this.databaseService.query(SYNC_QUEUE_PEEK_NEXT, [entity, count]);
  };

  nextSensors = async (count = 100): Promise<Sensor[]> => {
    const syncOuts = await this.nextSyncLogs(ENTITIES.SENSOR, count);
    return await this.databaseService.queryWith(ENTITIES.SENSOR, {
      where: { id: In(syncOuts.map(({ id }) => id)) },
    });
  };

  nextTemperatureLogs = async (count = 100): Promise<TemperatureLog[]> => {
    const syncOuts = await this.nextSyncLogs(ENTITIES.TEMPERATURE_LOG, count);
    return this.databaseService.queryWith(ENTITIES.TEMPERATURE_LOG, {
      where: { id: In(syncOuts.map(({ id }) => id)) },
    });
  };

  nextTemperatureBreaches = async (count = 100): Promise<TemperatureBreach[]> => {
    const syncOuts = await this.nextSyncLogs(ENTITIES.TEMPERATURE_BREACH, count);
    return this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH, {
      where: { id: In(syncOuts.map(({ id }) => id)) },
    });
  };

  dropLogs = async (logs: Syncable[]): Promise<void> => {
    const chunks: Syncable[][] = _.chunk(logs, 100);

    const queries: string[][] = chunks.map((chunk: any) => {
      return chunk.map(({ id }: Syncable) => {
        const qb = this.databaseService.getQueryBuilder();
        return qb.delete().from('SyncLog').where('id = :id', { id }).getQueryAndParameters();
      });
    });

    for (const queryChunks of queries) {
      await this.databaseService.sqlBatch(queryChunks);
    }

    return this.databaseService.query(SYNC_QUEUE_DROP, [logs.map(({ id }) => `"${id}"`).join(',')]);
  };

  length = async (): Promise<number> => {
    const [result] = await this.databaseService.query(SYNC_QUEUE_LENGTH);
    const { count } = result;

    return count;
  };

  lengthSensors = async (): Promise<number> => {
    const [result] = await this.databaseService.query(SYNC_QUEUE_LENGTH_FOR_TYPE, [
      ENTITIES.SENSOR,
    ]);
    const { count } = result;

    return count;
  };

  lengthTemperatureLogs = async (): Promise<number> => {
    const [result] = await this.databaseService.query(SYNC_QUEUE_LENGTH_FOR_TYPE, [
      ENTITIES.TEMPERATURE_LOG,
    ]);
    const { count } = result;
    return count;
  };

  lengthTemperatureBreaches = async (): Promise<number> => {
    const [result] = await this.databaseService.query(SYNC_QUEUE_LENGTH_FOR_TYPE, [
      ENTITIES.TEMPERATURE_BREACH,
    ]);
    const { count } = result;
    return count;
  };
}

export { SyncQueueManager };
