import { UtilService } from './../UtilService/UtilService';
import { migrations } from '~common/services/Database/migrations';
import { DatabaseService } from '~services/Database';
import packageJson from '../../../../package.json';

const { version } = packageJson;

export class MigrationService {
  dbService: DatabaseService;
  utils: UtilService;

  constructor(dbService: DatabaseService, utils: UtilService) {
    this.dbService = dbService;
    this.utils = utils;
  }

  getUserVersion = async (): Promise<number> => {
    const [result] = await this.dbService.rawQuery('PRAGMA user_version;');
    const { user_version: userVersion } = result;

    return userVersion;
  };

  /**
   * The user_version pragma was not used until 0.1.0 where we introduced the first migration code and
   * bumped the user_version to 1.
   *
   * Then, in 0.2.0 we introduced a more concrete migration mechanism, performed some more migrations
   * and bumped the user_version to 2.
   *
   * So, this function has been introduced in 0.2.0 to determine if we should run any migration on startup.
   *
   * The database will then be fresh if the user_version pragma is zero, and the version is greater than 0.1.0 -
   * if the version is 0.1.0 or below the user version is certainly zero.
   */
  isFreshDatabase = async (): Promise<boolean> => {
    const versionCode = await this.utils.getVersionCode(version);
    const userVersion = await this.getUserVersion();

    return userVersion === 0 && versionCode > this.utils.getVersionCode('0.1.0');
  };

  async start(): Promise<boolean> {
    // If the database is fresh, just bump the user_version pragma up to where every other database will be
    // if the migrations were run.
    if (await this.isFreshDatabase()) {
      await this.dbService.rawQuery(`PRAGMA user_version=${migrations.length}`);
      return true;
    }

    const userVersion = await this.getUserVersion();

    const migrationsToRun = migrations.splice(userVersion);

    try {
      await this.dbService.rawQuery('PRAGMA foreign_keys=OFF');

      await this.dbService.transaction(async () => {
        for (const migration of migrationsToRun) {
          await migration.migrate(this.dbService);
        }
      });

      await this.dbService.rawQuery(`PRAGMA user_version=${userVersion + migrationsToRun.length}`);

      return true;
    } catch (error) {
      return false;
    } finally {
      await this.dbService.rawQuery('PRAGMA foreign_keys=ON');
    }
  }
}
