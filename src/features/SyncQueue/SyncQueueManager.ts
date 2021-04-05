import { DatabaseService } from '../../common/services';
import { SyncLog } from '../../common/services/Database/entities';

const SYNC_QUEUE_NEXT = `
    SELECT * FROM synclog 
    ORDER BY timestamp
    LIMIT ?
`;

class SyncQueueManager {
  private databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  public async peek(count: number) {
    const result: SyncLog[] = await this.databaseService.query(SYNC_QUEUE_NEXT, [count]);
    return result;
  } 
}

export { SyncQueueManager }