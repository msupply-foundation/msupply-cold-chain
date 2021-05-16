import { DatabaseService } from '~services/Database';
import { Trigger } from './index';

const syncOnUpdate: Trigger = {
  install: (dbService: DatabaseService) => {
    const query = `
    CREATE TRIGGER IF NOT EXISTS update_SyncOutTemperatureLog
    AFTER
        UPDATE on TemperatureLog
    BEGIN
        INSERT OR REPLACE INTO
            SyncLog (id, payload, type, timestamp)
	    VALUES
	        (NEW.id, NEW.id, "TemperatureLog", strftime("%s", "now"));
    END
    `;

    return dbService.rawQuery(query);
  },
  remove: (dbService: DatabaseService) => {
    const query = 'DROP TRIGGER IF EXISTS update_SyncOutTemperatureLog';

    return dbService.rawQuery(query);
  },
};

const syncOnInsert: Trigger = {
  install: async (dbService: DatabaseService): Promise<void> => {
    const insertTrigger = `
    CREATE TRIGGER IF NOT EXISTS insert_SyncOutTemperatureLog
    AFTER
        INSERT on TemperatureLog 
    BEGIN
	    INSERT INTO
	        SyncLog (id, payload, type, timestamp)
	    VALUES
	        (NEW.id, NEW.id, "TemperatureLog", strftime("%s", "now"));
    END
    `;

    return dbService.rawQuery(insertTrigger);
  },

  remove: (dbService: DatabaseService) => {
    const query = 'DROP TRIGGER IF EXISTS insert_SyncOutTemperatureLog';
    return dbService.rawQuery(query);
  },
};

export const TemperatureLogTrigger = { syncOnInsert, syncOnUpdate };
