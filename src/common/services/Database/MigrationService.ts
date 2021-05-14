import { migrations } from '~common/services/Database/migrations';
import { DatabaseService } from '~services/Database';

export class MigrationService {
  dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  async start(): Promise<boolean> {
    const [result] = await this.dbService.query('PRAGMA user_version;');
    const { user_version: userVersion } = result;

    const migrationsToRun = migrations.splice(userVersion);

    try {
      await this.dbService.query('PRAGMA foreign_keys=OFF');

      await this.dbService.transaction(async () => {
        for (const migration of migrationsToRun) {
          await migration.migrate(this.dbService);
        }
      });

      await this.dbService.query(`PRAGMA user_version=${userVersion + migrationsToRun.length}`);

      return true;
    } catch (error) {
      return false;
    } finally {
      await this.dbService.query('PRAGMA foreign_keys=ON');
    }
  }
}
