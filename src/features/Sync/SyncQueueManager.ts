
import { ENTITIES } from '../../common/constants';
import { DatabaseService } from '../../common/services';
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

const SYNC_QUEUE_DROP_NEXT = `
  DELETE FROM synclog
  WHERE synclog.id IN 
  (
    SELECT id
    FROM synclog
    WHERE type = ?
    ORDER BY timestamp
    LIMIT ?
  ) 
`

const SYNC_QUEUE_DROP = `
  DELETE FROM synclog
  WHERE id IN (?)
`

const SYNC_QUEUE_LENGTH = `
  SELECT COUNT(*) FROM synclog
  WHERE type = ?
`

class SyncQueueManager {
  private databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  nextSensors = async (count?: number): Promise<SyncLog[]> => {
    if (count) return this.databaseService.query(SYNC_QUEUE_PEEK_NEXT, [ENTITIES.SENSOR, count]);
    return this.databaseService.query(SYNC_QUEUE_PEEK_ALL, [ENTITIES.SENSOR]);
  }

  nextTemperatureLogs = async (count?: number): Promise<SyncLog[]> => {
    if (count) return this.databaseService.query(SYNC_QUEUE_PEEK_NEXT, [ENTITIES.TEMPERATURE_LOG, count]);
    return this.databaseService.query(SYNC_QUEUE_PEEK_ALL, [ENTITIES.TEMPERATURE_LOG]);
  } 

  nextTemperatureBreaches = async (count?: number): Promise<SyncLog[]> => {
    if (count) return this.databaseService.query(SYNC_QUEUE_PEEK_NEXT, [ENTITIES.TEMPERATURE_BREACH, count]);
    return this.databaseService.query(SYNC_QUEUE_PEEK_ALL, [ENTITIES.TEMPERATURE_BREACH]);
  } 

  dropLogs = async (logs: SyncLog[]): Promise<void> => {
    return this.databaseService.query(SYNC_QUEUE_DROP, [logs.map(({ id }) => id).join()]);
  } 

  lengthSensors = async (): Promise<number> => this.databaseService.query(SYNC_QUEUE_LENGTH, [ENTITIES.SENSOR]);

  lengthTemperatureLogs = async (): Promise<number> => this.databaseService.query(SYNC_QUEUE_LENGTH, [ENTITIES.TEMPERATURE_LOG]);

  lengthTemperatureBreaches = async (): Promise<number> => this.databaseService.query(SYNC_QUEUE_LENGTH, [ENTITIES.TEMPERATURE_BREACH]);
}

export { SyncQueueManager }