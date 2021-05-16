import { ENTITIES } from '~constants';
import { Sensor, DatabaseService } from '~services/Database';
import { Setting, TemperatureBreach } from '~services/Database/entities';

interface OldTemperatureBreach {
  id: string;
  handled: number;
  sensorId: string;
  temperatureBreachConfigurationId: string;
  endTimestamp: number | null;
  startTimestamp: number;
}

export const migration0_0_4 = {
  // This migration performs the following:
  // - Changes sensor.macAddress to a NON unique field. This is so we can remove and reconnect sensors with different IDs.
  // - Adds sensor.isActive so we have a soft delete mechanism for sensors.
  migrate: async (dbService: DatabaseService): Promise<void> => {
    const sensors = await dbService.rawQuery(
      'select id, logInterval, batteryLevel, programmedDate, logDelay, name, macAddress from Sensor'
    );
    const createSensorTableQuery = Sensor.getTableDefinition();

    await dbService.rawQuery('DROP TABLE Sensor;');
    await dbService.rawQuery(createSensorTableQuery);
    await dbService.insert(ENTITIES.SENSOR, sensors);

    // Checking here if the column exists already before doing this migration. If migrating from 0.0.2 to 0.0.4
    // then the column will not exist, but 0.0.3 -> 0.0.4 will have the column as the code has been refactored.
    const sensorTableInfo = await dbService.rawQuery('PRAGMA table_info(Sensor);');
    const isActiveColumnDefinition = sensorTableInfo.find(
      (column: { cid: number; dflt_value: string; name: string }) => column.name === 'isActive'
    );

    if (!isActiveColumnDefinition) {
      await dbService.query('ALTER TABLE Sensor ADD COLUMN isActive integer default 1');
    }

    const breachTableInfo = await dbService.rawQuery('PRAGMA table_info(TemperatureBreach);');
    const handledColumnDefinition = breachTableInfo.find(
      (column: { cid: number; dflt_value: string; name: string }) => column.name === 'handled'
    );

    if (handledColumnDefinition) {
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
    }

    const settings = await dbService.rawQuery('SELECT key, value from Setting;');
    const createSettingTableQuery = Setting.getTableDefinition();

    await dbService.rawQuery('DROP TABLE Setting;');
    await dbService.rawQuery(createSettingTableQuery);
    await dbService.insert(ENTITIES.SETTING, settings);
  },
};
