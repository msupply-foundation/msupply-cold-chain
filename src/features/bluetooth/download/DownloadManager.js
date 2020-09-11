import moment from 'moment';
import { uuid } from '../../../services/utilities';
import { ENTITIES, MILLISECONDS } from '~constants';

export class DownloadManager {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // Calculates the number of sensor logs that should be saved from some given starting
  // point. Where the starting point is the timestamp for the next log.
  // TODO: Do this in SQL
  calculateNumberOfLogsToSave = (
    nextPossibleLogTime = 0,
    logInterval,
    timeNow = moment().unix()
  ) => {
    const now = moment(timeNow * MILLISECONDS.ONE_SECOND);
    const startingMoment = moment(nextPossibleLogTime * MILLISECONDS.ONE_SECOND);
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

  createLogs = (logs, sensor, maxNumberToSave, mostRecentLogTime, timeNow = moment().unix()) => {
    const { logInterval, id: sensorId } = sensor;
    const sliceIndex = logs.length - maxNumberToSave;
    const logsToSave = logs.slice(sliceIndex);

    let initial;
    if (!mostRecentLogTime) {
      initial = moment(timeNow * MILLISECONDS.ONE_SECOND);
      initial.subtract((logsToSave.length - 1) * logInterval, 'seconds');
    } else {
      const now = moment().unix();
      const numberOfLogIntervalsUntilNow = Math.floor((now - mostRecentLogTime) / logInterval) + 1;
      // Take the most recent log timestamp and count log intervals until now, then, remove the log intervals
      // for the number we are saving up to.

      initial = moment(
        (mostRecentLogTime +
          (numberOfLogIntervalsUntilNow * logInterval - maxNumberToSave * logInterval)) *
          1000
      );
    }

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
