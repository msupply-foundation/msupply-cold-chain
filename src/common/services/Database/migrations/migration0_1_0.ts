import { ENTITIES } from '~constants/Entities';
import { DatabaseService } from '~common/services/Database/DatabaseService';
import { Sensor } from '~common/services/Database/entities';

export const migration0_1_0 = {
  // This migration performs the following:
  // - Changes sensor.macAddress to a NON unique field. This is so we can remove and reconnect sensors with different IDs.
  // - Adds sensor.isActive so we have a soft delete mechanism for sensors.
  migrate: async (dbService: DatabaseService): Promise<void> => {
    const sensors = await dbService.query(
      'select id, logInterval, batteryLevel, programmedDate, logDelay, name, macAddress from Sensor'
    );
    const createNewSensorTableQuery = Sensor.getTableDefinition();

    await dbService.query('DROP TABLE Sensor;');
    await dbService.query(createNewSensorTableQuery);
    await dbService.insert(ENTITIES.SENSOR, sensors);
  },
};
