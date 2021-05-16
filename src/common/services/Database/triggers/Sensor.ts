import { DatabaseService } from '~services/Database';
import { Trigger } from './index';

const syncOnUpdate: Trigger = {
  install: (dbService: DatabaseService) => {
    const query = `
    CREATE TRIGGER IF NOT EXISTS update_SyncOutSensor
    AFTER
        UPDATE on Sensor 
    BEGIN
        INSERT OR REPLACE INTO
            SyncLog (id, payload, type, timestamp)
	    VALUES
	        (NEW.id, NEW.id, "Sensor", strftime("%s", "now"));
    END
    `;

    return dbService.rawQuery(query);
  },
  remove: (dbService: DatabaseService) => {
    const query = 'DROP TRIGGER IF EXISTS update_SyncOutSensor';

    return dbService.rawQuery(query);
  },
};

const syncOnInsert: Trigger = {
  install: async (dbService: DatabaseService): Promise<void> => {
    const insertTrigger = `
    CREATE TRIGGER IF NOT EXISTS insert_SyncOutSensor
    AFTER
        INSERT on Sensor 
    BEGIN
	    INSERT INTO
	        SyncLog (id, payload, type, timestamp)
	    VALUES
	        (NEW.id, NEW.id, "Sensor", strftime("%s", "now"));
    END
    `;

    return dbService.rawQuery(insertTrigger);
  },

  remove: (dbService: DatabaseService) => {
    const query = 'DROP TRIGGER IF EXISTS insert_SyncOutSensor';
    return dbService.rawQuery(query);
  },
};

export const SensorTrigger = { syncOnInsert, syncOnUpdate };
