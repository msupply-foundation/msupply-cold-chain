import { DatabaseService } from '~services/Database';

import { migration0_1_0 } from './migration0_1_0';
import { migration0_2_0 } from './migration0_2_0';

/**
 * Migrations are handled through creating a migration object for each change to the schema.
 * Migration objects should be added to the migrations array. Migrations are run simply by
 * taking the user_version pragma and using it as an index into the migrations array.
 *
 *
 * A migration object is passed the database service and can make any changes needed. The
 * migrate function is run AFTER turning foreign keys off and is run within a transaction.
 * Errors should be thrown when failing.
 *
 */

export interface Migration {
  migrate: (database: DatabaseService) => Promise<void>;
  // revert?: (database: DatabaseService) => Promise<void>;
}

export const migrations: Migration[] = [migration0_1_0, migration0_2_0];
