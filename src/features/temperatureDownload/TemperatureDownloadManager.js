import moment from 'moment';
import { uuid } from '~services/utilities';
import { ENTITIES, MILLISECONDS } from '~constants';

export class TemperatureDownloadManager {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // Calculates the number of sensor logs that should be saved from some given starting
  // point. Where the starting point is the timestamp for the next log.
  calculateNumberOfLogsToSave = (mostRecentLogTime = 0, logInterval, timeNow = moment().unix()) => {
    const now = moment(timeNow * MILLISECONDS.ONE_SECOND);
    const startingMoment = moment(mostRecentLogTime * MILLISECONDS.ONE_SECOND).add(
      logInterval,
      's'
    );
    // If the time for the next log is in the future, then don't save any.
    if (startingMoment.isAfter(now)) return 0;
    // Calculate the seconds between the starting time and now.
    const secondsBetween = now.diff(startingMoment, 's', true);
    // For example, if there are 1 log interval between the starting time and now,
    // then the times are for example, 0955 and 1000 - so, we save both the 0955 log
    // and the 1000 log. If there was less than one log interval between, then the
    // times would be 0955 and 0957 - so we only save a single log, as the 1000 log
    // has not been recorded yet.
    return Math.floor(secondsBetween / logInterval) + 1;
  };

  createLogs = (logs, sensor, maxNumberToSave, timeNow = moment().unix()) => {
    const { logInterval, id: sensorId } = sensor;
    const sliceIndex = logs.length - maxNumberToSave;
    const logsToSave = logs.slice(sliceIndex);

    const initial = moment(timeNow * MILLISECONDS.ONE_SECOND);
    initial.subtract((logsToSave.length - 1) * logInterval, 'seconds');

    return logsToSave.map(({ temperature }, i) => {
      const offset = logInterval * i;
      const timestamp = Number(moment(initial).add(offset, 's').format('X'));
      const id = uuid();

      return { id, sensorId, timestamp, temperature, logInterval };
    });
  };

  saveLogs = async logsToSave => {
    return this.databaseService.upsert(ENTITIES.TEMPERATURE_LOG, logsToSave);
  };
}
