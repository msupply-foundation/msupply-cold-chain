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

  nextSensors = async (count?: number): Promise<SyncLog[]> => {
    if (count) return this.databaseService.query(SYNC_QUEUE_PEEK_NEXT, [ENTITIES.SENSOR, count]);
    return this.databaseService.query(SYNC_QUEUE_PEEK_ALL, [ENTITIES.SENSOR]);
  };

  nextTemperatureLogs = async (count?: number): Promise<SyncLog[]> => {
    if (count) {
      return this.databaseService.query(SYNC_QUEUE_PEEK_NEXT, [ENTITIES.TEMPERATURE_LOG, count]);
    }

    return this.databaseService.query(SYNC_QUEUE_PEEK_ALL, [ENTITIES.TEMPERATURE_LOG]);
  };

  nextTemperatureBreaches = async (count?: number): Promise<SyncLog[]> => {
    if (count) {
      return this.databaseService.query(SYNC_QUEUE_PEEK_NEXT, [ENTITIES.TEMPERATURE_BREACH, count]);
    }

    return this.databaseService.query(SYNC_QUEUE_PEEK_ALL, [ENTITIES.TEMPERATURE_BREACH]);
  };

  dropLogs = async (logs: SyncLog[]): Promise<void> => {
    return this.databaseService.query(SYNC_QUEUE_DROP, [logs.map(({ id }) => id).join()]);
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
