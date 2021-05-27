import { ENTITIES } from '~constants';
import { DatabaseService } from '~services/Database';
import { Setting, TemperatureBreach } from '~services/Database/entities';

interface OldTemperatureBreach {
  id: string;
  handled: number;
  sensorId: string;
  temperatureBreachConfigurationId: string;
  endTimestamp: number | null;
  startTimestamp: number;
}

export const migration0_2_0 = {
  // This migration performs the following:
  // - Alters the TemperatureBreach table, renaming `handled` to `acknowledged` to be consistent within the system.
  // - Alters the Setting table such that the key is the primary key, dropping the `id` field.
  migrate: async (dbService: DatabaseService): Promise<void> => {
    const breaches: OldTemperatureBreach[] = await dbService.rawQuery(
      'SELECT id, endTimestamp, startTimestamp, temperatureBreachConfigurationId, sensorId, handled from TemperatureBreach'
    );
    const updatedBreaches = breaches.map(({ handled, ...rest }) => ({
      ...rest,
      acknowledged: Boolean(handled),
    }));

    const createBreachTableQuery = TemperatureBreach.getTableDefinition();

    await dbService.rawQuery('DROP TABLE TemperatureBreach;');
    await dbService.rawQuery(createBreachTableQuery);
    await dbService.insert(ENTITIES.TEMPERATURE_BREACH, updatedBreaches);

    const settings = await dbService.rawQuery('SELECT DISTINCT key, value from Setting;');
    const createSettingTableQuery = Setting.getTableDefinition();

    await dbService.rawQuery('DROP TABLE Setting;');
    await dbService.rawQuery(createSettingTableQuery);
    await dbService.insert(ENTITIES.SETTING, settings);
  },
};
