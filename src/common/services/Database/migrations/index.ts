import { DatabaseService } from '~common/services/Database/DatabaseService';
import { migration0_0_3 } from '~common/services/Database/migrations/0_0_3';

export interface Migration {
  migrate: (database: DatabaseService) => Promise<void>;
  down?: (database: DatabaseService) => Promise<void>;
}

export const migrations: Migration[] = [migration0_0_3];
