import { SensorState } from '../../Entities/Sensor/SensorSlice';
import { ENTITIES } from '../../../common/constants';
import { DatabaseService, UtilService } from '../../../common/services';
import { UnixTimestamp } from '~common/types/common';

interface TemperatureLog {
  id: string;
  sensorId: string;
  timestamp: number;
  temperature: number;
  logInterval: number;
}

export class DownloadManager {
  databaseService: DatabaseService;

  utils: UtilService;

  constructor(databaseService: DatabaseService, utils: UtilService) {
    this.databaseService = databaseService;
    this.utils = utils;
  }

  // Calculates the number of sensor logs that should be saved from some given starting
  // point. Where the starting point is the timestamp for the next log.
  calculateNumberOfLogsToSave = (nextPossibleLogTime = 0, logInterval: UnixTimestamp): number => {
    const now = this.utils.now();

    // If the time for the next log is in the future, then don't save any.
    if (nextPossibleLogTime > now) return 0;
    // Calculate the seconds between the starting time and now.
    const secondsBetween = now - nextPossibleLogTime;
    // For example, if there are 1 log interval between the starting time and now,
    // then the times are for example, 0955 and 1000 - so, we save both the 0955 log
    // and the 1000 log. If there was less than one log interval between, then the
    // times would be 0955 and 0957 - so we only save a single log, as the 1000 log
    // has not been recorded yet.

    return Math.floor(secondsBetween / logInterval) + 1;
  };

  createLogs = (
    logs: Partial<TemperatureLog>[],
    sensor: SensorState,
    maxNumberToSave: number,
    mostRecentLogTime: UnixTimestamp
  ): TemperatureLog[] => {
    const now = this.utils.now();
    const { logInterval, id: sensorId } = sensor;
    const sliceIndex = logs.length - maxNumberToSave;
    const logsToSave = logs.slice(sliceIndex);

    let initial = 0;
    if (!mostRecentLogTime) {
      const lookbackSeconds = (logsToSave.length - 1) * logInterval;
      initial = now - lookbackSeconds;
    } else {
      const numberOfLogIntervalsUntilNow = Math.floor((now - mostRecentLogTime) / logInterval) + 1;

      // This 'lookback' (as opposed to only counting forward) is necessary to account for
      // potential gaps in logs (e.g. due to battery running out)
      // The number of log intervals until now, could be more then the max number to save, in which case,
      // we create a 'gap' in logs which is our best guess as to when the sensor stopped recording.
      const lookback = numberOfLogIntervalsUntilNow * logInterval - maxNumberToSave * logInterval;
      initial = mostRecentLogTime + lookback;
    }

    return logsToSave.map(({ temperature = 0 }, i) => {
      const offset = logInterval * i;
      const timestamp = initial + offset;
      const id = this.utils.uuid();

      return { id, sensorId, timestamp, temperature, logInterval };
    });
  };

  saveLogs = async (logsToSave: Partial<TemperatureLog>[]): Promise<TemperatureLog[]> => {
    return this.databaseService.insert(ENTITIES.TEMPERATURE_LOG, logsToSave);
  };
}
