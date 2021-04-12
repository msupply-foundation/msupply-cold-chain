import { DatabaseService } from '../../common/services';
import { SyncLog } from '../../common/services/Database/entities';

const SYNC_QUEUE_PEEK_NEXT = `
    SELECT * FROM synclog 
    ORDER BY timestamp
    LIMIT ?
`;

const SYNC_QUEUE_PEEK_ALL = `
    SELECT * FROM synclog 
    ORDER BY timestamp
`;

const SYNC_QUEUE_DROP_NEXT = `
  DELETE FROM synclog
  WHERE synclog.id IN 
  (
    SELECT id
    FROM synclog
    ORDER BY timestamp
    LIMIT ?
  ) 
`

const SYNC_QUEUE_DROP_ALL = `
  DELETE FROM synclog
`

const SYNC_QUEUE_LENGTH = `
  SELECT COUNT(*) FROM synclog
`

class SyncQueueManager {
  private databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  peekNext = async (count: number) => {
    const result: SyncLog[] = await this.databaseService.query(SYNC_QUEUE_PEEK_NEXT, [count]);
    return result;
  } 

  peekAll = async () => {
    const result: SyncLog[] = await this.databaseService.query(SYNC_QUEUE_PEEK_ALL);
    return result;
  }

  dropNext = async (count: number) => this.databaseService.query(SYNC_QUEUE_DROP_NEXT, [count]);

  dropAll = async () => this.databaseService.query(SYNC_QUEUE_DROP_ALL);

  length = async () => this.databaseService.query(SYNC_QUEUE_LENGTH);
}

export { SyncQueueManager }