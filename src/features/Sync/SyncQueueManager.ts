import _ from 'lodash';
import { In } from 'typeorm/browser';
import { ENTITIES } from '../../common/constants';
import { DatabaseService, UtilService } from '../../common/services';
import { SyncLog } from '../../common/services/Database/entities';

const SYNC_QUEUE_PEEK_NEXT = `
    SELECT * FROM synclog
    WHERE type = ? 
    ORDER BY timestamp
    LIMIT ?
`;

const SYNC_QUEUE_PEEK_ALL = `
    SELECT * FROM synclog 
    WHERE type = ? 
    ORDER BY timestamp
`;

// const SYNC_QUEUE_DROP_NEXT = `
//   DELETE FROM synclog
//   WHERE synclog.id IN
//   (
//     SELECT id
//     FROM synclog
//     WHERE type = ?
//     ORDER BY timestamp
//     LIMIT ?
//   )
// `;

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

  private utilService: UtilService;

  constructor(databaseService: DatabaseService, utilService: UtilService) {
    this.databaseService = databaseService;
    this.utilService = utilService;
  }

  pushLog = async (id: string, type: string, payload: string): Promise<SyncLog> => {
    return this.databaseService.save(ENTITIES.SYNC_LOG, {
      id,
      type,
      payload,
      timestamp: this.utilService.now(),
    });
  };

  nextSyncLogs = async (entity: string, count = 999): Promise<SyncLog[]> => {
    return this.databaseService.query(SYNC_QUEUE_PEEK_NEXT, [entity, count]);
  };

  nextSensors = async (count = 999): Promise<SyncLog[]> => {
    const syncOuts = await this.nextSyncLogs(ENTITIES.SENSOR, count);
    const sensors = await this.databaseService.queryWith(ENTITIES.SENSOR, {
      where: { id: In(syncOuts.map(({ id }) => id)) },
    });
    return sensors;
  };

  nextTemperatureLogs = async (count = 999): Promise<SyncLog[]> => {
    const syncOuts = await this.nextSyncLogs(ENTITIES.TEMPERATURE_LOG, count);
    const temperatureLogs = await this.databaseService.queryWith(ENTITIES.TEMPERATURE_LOG, {
      where: { id: In(syncOuts.map(({ id }) => id)) },
    });
    return temperatureLogs;
  };

  nextTemperatureBreaches = async (count = 999): Promise<SyncLog[]> => {
    const syncOuts = await this.nextSyncLogs(ENTITIES.TEMPERATURE_BREACH, count);
    const breaches = await this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH, {
      where: { id: In(syncOuts.map(({ id }) => id)) },
    });
    return breaches;
  };

  dropLogs = async (logs: any[]): Promise<void> => {
    const chunks: any[][] = _.chunk(logs, 100);

    const queries: string[][] = chunks.map((chunk: any) => {
      return chunk.map(({ id }: any) => {
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
