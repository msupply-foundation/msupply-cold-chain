import { ENTITIES } from './../../../constants/Entities';
import { DatabaseService } from '~common/services/Database/DatabaseService';
import { Sensor } from '~common/services/Database/entities';

export const migration0_0_3 = {
  // This migration performs the following:
  // - Changes sensor.macAddress to a NON unique field. This is so we can remove and reconnect sensors with different IDs.
  // - Adds sensor.isActive so we have a soft delete mechanism for sensors.
  migrate: async (dbService: DatabaseService): Promise<void> => {
    const sensors = await dbService.query(
      'select id, logInterval, batteryLevel, programmedDate, logDelay, name, macAddress from Sensor'
    );
    const createSensorTableQuery = Sensor.getTableDefinition();

    await dbService.query('PRAGMA foreign_keys=OFF');

    try {
      await dbService.transaction(async () => {
        await dbService.query('DROP TABLE Sensor;');
        await dbService.query(createSensorTableQuery);
        await dbService.insert(ENTITIES.SENSOR, sensors);
      });
    } finally {
      await dbService.query('PRAGMA foreign_keys=ON');
    }
  },
};
