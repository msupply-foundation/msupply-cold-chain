import moment from 'moment';

import { DATABASE_UTIL_ERROR } from '~constants';

import { DatabaseUtilsService } from './DatabaseUtilsService';

const logInterval = 300;
const id = '1';
const sensorId = '1';

describe('saveSensorLogs', () => {
  it('returns an empty array when no logs are passed', () => {
    const dbUtilsService = new DatabaseUtilsService();
    const pretendLogsToSave = [];
    const pretendSensor = { id, logInterval };
    const timeNow = moment();
    const startingTime = timeNow.subtract(logInterval, 's');
    const shouldBe = [];

    const maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(
      startingTime,
      logInterval,
      timeNow
    );

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);
  });

  it('returns an array of mapped sensor log objects', () => {
    const dbUtilsService = new DatabaseUtilsService();

    const pretendLogsToSave = [{ temperature: 1 }, { temperature: 2 }];
    const pretendSensor = { id, logInterval };

    // Assume this is 10:00
    const timeNow = moment(0);

    // mostRecentLog time is the time of the last log saved to the database. Assume
    // 5 minutes, then this is 9:50.
    const startingTime = moment(timeNow).subtract(logInterval * 2, 's');

    // The logs should have the times 9:55 and 10:00.
    const nextLogTime = Number(
      moment(timeNow)
        .subtract(logInterval * 1, 's')
        .format('x')
    );
    const logAfterThatTime = Number(
      moment(timeNow)
        .subtract(logInterval * 0, 's')
        .format('x')
    );

    const shouldBe = [
      { temperature: 1, id, timestamp: nextLogTime, sensorId },
      { temperature: 2, id, timestamp: logAfterThatTime, sensorId },
    ];

    const maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(
      startingTime,
      logInterval,
      timeNow
    );

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);
  });

  // For example, if passing three logs downloaded from a sensor, then the last log downloaded must be
  // . i.e if the log interval is 5 minutes, and the time now is 10:00, then the last log must be for the
  // time 09:45, then the next three logs are for 9:50, 9:55, and 10:00. If the last log is 9:50, that means
  // the first log of the three being passed must be a duplicate.
  it('Ignores extra logs passed which are duplicates.', () => {
    const dbUtilsService = new DatabaseUtilsService();

    // Use three logs to pass.
    const pretendLogsToSave = [
      { temperature: 1 },
      { temperature: 2 },
      { temperature: 3 },
      { temperature: 4 },
    ];
    const pretendSensor = { id, logInterval };

    // Take the time now: as an example, assume it is 1000
    const timeNow = moment(0);

    // The start time is the most recently downloaded log. This will be 9.45.
    const startingTime = moment(timeNow).subtract(3 * logInterval, 's');

    // The first timestamp should be 0950.
    const timestampOne = Number(
      moment(timeNow)
        .subtract(logInterval * 2, 's')
        .format('x')
    );

    // The second timestamp should be 0955.
    const timestampTwo = Number(
      moment(timeNow)
        .subtract(logInterval * 1, 's')
        .format('x')
    );

    // The last timestamp should be 1000.
    const timestampThree = Number(
      moment(timeNow)
        .subtract(logInterval * 0, 's')
        .format('x')
    );

    const shouldBe = [
      { temperature: 2, id, timestamp: timestampOne, sensorId },
      { temperature: 3, id, timestamp: timestampTwo, sensorId },
      { temperature: 4, id, timestamp: timestampThree, sensorId },
    ];

    const maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(
      startingTime,
      logInterval,
      timeNow
    );

    // Pass the three logs, and a date saying the next temperature to store is 9.50.
    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);
  });

  it('returns an empty array when the starting date is in the future', () => {
    const dbUtilsService = new DatabaseUtilsService();
    const pretendLogsToSave = [];
    const pretendSensor = { id, logInterval };

    let timeNow = moment(0);

    let offset = 1;
    let startTime = moment(timeNow).add(offset, 's');
    let shouldBe = [];

    let maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(
      startTime,
      logInterval,
      timeNow
    );

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);

    timeNow = moment(0);
    offset = logInterval;
    startTime = moment(timeNow).add(logInterval, 's');
    shouldBe = [];

    maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(startTime, logInterval, timeNow);

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);

    timeNow = moment(0);
    offset = logInterval;
    startTime = moment(timeNow).add(0.1, 's');
    shouldBe = [];

    maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(startTime, logInterval, timeNow);

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);
  });

  it('returns a single element array when the starting date is exactly one logInterval behind the time now', () => {
    const dbUtilsService = new DatabaseUtilsService();

    const pretendLogsToSave = [{ temperature: 1 }];
    const pretendSensor = { id, logInterval };

    const timeNow = moment(0);
    const startTime = moment(timeNow).subtract(logInterval, 's');

    const shouldBe = [{ temperature: 1, sensorId, id, timestamp: Number(timeNow.format('x')) }];

    const maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(
      startTime,
      logInterval,
      timeNow
    );

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);
  });

  it('returns one logs when the starting date is more than a log interval in the past, but less than two', () => {
    const dbUtilsService = new DatabaseUtilsService();

    const pretendLogsToSave = [{ temperature: 1 }, { temperature: 2 }, { temperature: 3 }];
    const pretendSensor = { id, logInterval };

    // An offset of more than one logInterval - i.e. 5 minutes and one second.
    // Would make a base time of 1000 -> 0954
    let timeNow = moment(0);
    let offset = logInterval + 1;
    let startTime = moment(timeNow).subtract(offset, 's');

    let firstTimestamp = Number(moment(timeNow).format('x'));
    let shouldBe = [{ temperature: 3, sensorId, id, timestamp: firstTimestamp }];

    let maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(
      startTime,
      logInterval,
      timeNow
    );

    // Check if we are saving the last two logs. One for 0955 and one for 1000
    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);

    // An offset of slightly less than one logInterval. If the time now is 1000, then
    // this would make the start time 0951. So, we can only have the 0951 and 0956 logs.
    timeNow = moment(0);
    offset = logInterval + (logInterval - 1);
    startTime = moment(timeNow).subtract(offset, 's');
    firstTimestamp = Number(moment(timeNow).format('x'));

    shouldBe = [{ temperature: 3, sensorId, id, timestamp: firstTimestamp }];

    maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(startTime, logInterval, timeNow);

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);
  });

  it('returns an empty array when the most recent log date is less than one log interval in the past', () => {
    const dbUtilsService = new DatabaseUtilsService();

    const pretendLogsToSave = [{ temperature: 1 }, { temperature: 2 }, { temperature: 3 }];
    const pretendSensor = { id, logInterval };

    let timeNow = moment(0);
    // An offset of less than one log interval means if the time is currently 1000
    // then the startTime is 0956 with a 5 minute log interval.
    let offset = logInterval - 1;
    let startTime = moment(timeNow).subtract(offset, 's');
    let shouldBe = [];

    let maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(
      startTime,
      logInterval,
      timeNow
    );

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);

    // An offset of 1 so just slightly less than a full log interval.
    timeNow = moment(0);
    offset = logInterval - (logInterval - 1);
    startTime = moment(timeNow).subtract(offset, 's');
    shouldBe = [];

    maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(startTime, logInterval, timeNow);

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);

    // An offset equal to the log interval should not return only one element when passed multiple.
    timeNow = moment(0);
    offset = logInterval;
    startTime = moment(timeNow).subtract(offset, 's');
    shouldBe = [];

    maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(startTime, logInterval, timeNow);

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).not.toEqual(shouldBe);
  });

  it('returns two logs when more than two log intervals in the past', () => {
    const dbUtilsService = new DatabaseUtilsService();
    const pretendLogsToSave = [{ temperature: 1 }, { temperature: 2 }];
    const pretendSensor = { id, logInterval };

    // Assume 1000
    let timeNow = moment(0);

    // The most recent log is 0950
    let startTime = moment(timeNow).subtract(2 * logInterval, 's');

    // First timestamp 0955, second 1000
    let firstTimestamp = Number(moment(timeNow).subtract(logInterval, 's').format('x'));
    let secondTimestamp = Number(moment(timeNow).format('x'));

    let shouldBe = [
      { timestamp: firstTimestamp, temperature: 1, id, sensorId },
      { timestamp: secondTimestamp, temperature: 2, id, sensorId },
    ];

    let maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(
      startTime,
      logInterval,
      timeNow
    );

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);

    // Assume 1000
    timeNow = moment(0);

    // The most recent log is 0950
    startTime = moment(timeNow).subtract(2 * logInterval + logInterval / 2, 's');

    // First timestamp 0955, second 1000
    firstTimestamp = Number(moment(timeNow).subtract(logInterval, 's').format('x'));
    secondTimestamp = Number(moment(timeNow).format('x'));

    shouldBe = [
      { timestamp: firstTimestamp, temperature: 1, id, sensorId },
      { timestamp: secondTimestamp, temperature: 2, id, sensorId },
    ];

    maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(startTime, logInterval, timeNow);

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);
  });

  it('skips time if ', () => {
    const dbUtilsService = new DatabaseUtilsService();
    const pretendLogsToSave = [{ temperature: 1 }, { temperature: 2 }];

    const pretendSensor = { id: '1', logInterval: 300 };

    let timeNow = moment(0);
    let startTime = moment(timeNow).subtract(logInterval * 10, 's');

    let timestampOne = Number(moment(timeNow).subtract(logInterval, 's').format('x'));
    let timestampTwo = Number(moment(timeNow).format('x'));

    let shouldBe = [
      { temperature: 1, timestamp: timestampOne, sensorId, id },
      { temperature: 2, timestamp: timestampTwo, sensorId, id },
    ];

    let maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(
      startTime,
      logInterval,
      timeNow
    );

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);

    timeNow = moment(0);
    startTime = moment(timeNow).subtract(logInterval * 100, 's');

    timestampOne = Number(moment(timeNow).subtract(logInterval, 's').format('x'));
    timestampTwo = Number(moment(timeNow).format('x'));

    shouldBe = [
      { temperature: 1, timestamp: timestampOne, sensorId, id },
      { temperature: 2, timestamp: timestampTwo, sensorId, id },
    ];

    maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(startTime, logInterval, timeNow);

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave, timeNow)
    ).toEqual(shouldBe);
  });

  it('Does not save duplicate logs', () => {
    const dbUtilsService = new DatabaseUtilsService();

    // Array of [{temperature: x1}, {temperature: x2}, .. {temperature: xn}]
    const pretendLogsToSave = Array.from({ length: 10 }).map((_, i) => ({ temperature: i }));
    const pretendSensor = { id, logInterval };

    const timeNow = moment(0);
    const startTime = moment(timeNow).subtract(logInterval, 's');
    const maxNumberOfLogs = dbUtilsService.calculateNumberOfLogsToSave(
      startTime,
      logInterval,
      timeNow
    );

    expect(
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberOfLogs, timeNow)
    ).toEqual([{ temperature: 9, timestamp: Number(timeNow.format('x')), sensorId, id }]);
  });

  it('throws an error when the max number of logs to save is not a number', () => {
    const dbUtilsService = new DatabaseUtilsService();
    const pretendLogsToSave = [{ temperature: 1 }, { temperature: 2 }];
    const pretendSensor = { id, logInterval };

    expect(() =>
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, '')
    ).toThrowError(DATABASE_UTIL_ERROR.CREATE_SENSOR_LOGS_INVALID_NUMBER);
  });

  it('throws an error if no sensor is passed', () => {
    const dbUtilsService = new DatabaseUtilsService();
    const pretendLogsToSave = [];
    const pretendSensor = null;
    const startTime = moment(0);

    const maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(startTime, logInterval);

    expect(() =>
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave)
    ).toThrow(DATABASE_UTIL_ERROR.CREATE_SENSOR_LOGS_WITH_NO_SENSOR);
  });

  it('throws an error if an invalid sensor is passed', () => {
    const dbUtilsService = new DatabaseUtilsService();
    const pretendLogsToSave = [{ temperature: 1 }, { temperature: 2 }];
    const pretendSensor = {};
    const startTime = moment(0);

    expect(() =>
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, startTime)
    ).toThrow(DATABASE_UTIL_ERROR.CREATE_SENSOR_LOGS_INVALID_SENSOR);
  });

  it('throws when a sensor log has no temperature', () => {
    const dbUtilsService = new DatabaseUtilsService();
    const pretendLogsToSave = [{}];
    const pretendSensor = { id, logInterval };
    const startTime = moment().subtract(logInterval + 1, 's');

    const maxNumberToSave = dbUtilsService.calculateNumberOfLogsToSave(startTime, logInterval);

    expect(() =>
      dbUtilsService.createSensorLogs(pretendLogsToSave, pretendSensor, maxNumberToSave)
    ).toThrow(DATABASE_UTIL_ERROR.CREATE_SENSOR_LOGS_WITH_NO_TEMPERATURE);
  });
});

describe('DatabaseUtilsService: calculateNumberOfLogsToSave', () => {
  it('Returns the correct number of records to save', () => {
    const Utils = new DatabaseUtilsService();

    let startTime = moment();
    expect(Utils.calculateNumberOfLogsToSave(startTime, logInterval)).toEqual(0);

    startTime = moment().subtract(logInterval, 's');
    expect(Utils.calculateNumberOfLogsToSave(startTime, logInterval)).toEqual(1);

    startTime = moment().subtract(logInterval * 10, 's');
    expect(Utils.calculateNumberOfLogsToSave(startTime, logInterval)).toEqual(10);

    startTime = moment().add(1, 's');
    expect(Utils.calculateNumberOfLogsToSave(startTime, logInterval)).toEqual(0);
  });
});

describe('', () => {
  it('maps sensor logs correctly', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [{ temperature: 1 }];
    const initialTimestamp = moment(0);
    const sensor = { id, logInterval };

    const mapped = Utils.mapLogs(logs, initialTimestamp, sensor);

    expect(mapped).toEqual([{ temperature: 1, timestamp: 0, id, sensorId }]);
  });
  it('throws when logs are not an array', () => {
    const Utils = new DatabaseUtilsService();

    const logs = '';
    const initialTimestamp = moment(0);
    const sensor = { id, logInterval };

    expect(() => Utils.mapLogs(logs, initialTimestamp, sensor)).toThrowError(
      DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_LOGS
    );
  });
  it('throws when timestamp is not a valid timestamp', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [{ temperature: 1 }];
    const initialTimestamp = '';
    const sensor = { id, logInterval };

    expect(() => Utils.mapLogs(logs, initialTimestamp, sensor)).toThrowError(
      DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_TIMESTAMP
    );
  });
  it('throws when sensor is not a valid', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [{ temperature: 1 }];
    const initialTimestamp = moment(0);
    const sensor = { logInterval };

    expect(() => Utils.mapLogs(logs, initialTimestamp, sensor)).toThrowError(
      DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_SENSOR
    );
  });
  it('throws when sensor is not a valid', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [{ temperature: 1 }];
    const initialTimestamp = moment(0);
    const sensor = { id };

    expect(() => Utils.mapLogs(logs, initialTimestamp, sensor)).toThrowError(
      DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_SENSOR
    );
  });
  it('throws when sensor is not a valid', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [{ temperature: 1 }];
    const initialTimestamp = moment(0);
    const sensor = null;

    expect(() => Utils.mapLogs(logs, initialTimestamp, sensor)).toThrowError(
      DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_SENSOR
    );
  });
  it('throws when sensor is not a valid', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [{ temperature: 1 }];
    const initialTimestamp = moment(0);
    const sensor = [];

    expect(() => Utils.mapLogs(logs, initialTimestamp, sensor)).toThrowError(
      DATABASE_UTIL_ERROR.MAP_LOGS_INVALID_SENSOR
    );
  });
});
