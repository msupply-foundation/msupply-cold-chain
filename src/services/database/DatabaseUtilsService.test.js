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

    startTime = null;
    const shouldBe = Math.floor(new Date().getTime() / (logInterval * 1000));
    expect(Utils.calculateNumberOfLogsToSave(startTime, logInterval)).toEqual(shouldBe);
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

describe('DatabaseUtilsService: aggregateSensorLogs', () => {
  it('aggregates a set of sensor logs into a single temperature log', () => {
    const Utils = new DatabaseUtilsService();

    let logs = [
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 2, timestamp: 1, sensorId: '1', id: '2' },
      { temperature: 3, timestamp: 2, sensorId: '1', id: '3' },
    ];

    let expectedResult = { temperature: 2, timestamp: 0, sensorId: '1', id: '1' };

    let result = Utils.aggregateSensorLogs(logs);

    expect(result).toEqual(expectedResult);

    logs = [
      { temperature: 3, timestamp: 99, sensorId: '1', id: '1' },
      { temperature: 6, timestamp: 100, sensorId: '1', id: '2' },
      { temperature: 9, timestamp: 101, sensorId: '1', id: '3' },
    ];

    expectedResult = { temperature: 6, timestamp: 99, sensorId: '1', id: '1' };

    result = Utils.aggregateSensorLogs(logs);

    expect(result).toEqual(expectedResult);
  });
  it('correctly aggregates a single record', () => {
    const Utils = new DatabaseUtilsService();
    const logs = [{ temperature: 0, timestamp: 99, sensorId: '1', id: '1' }];

    const expectedResult = { temperature: 0, timestamp: 99, sensorId: '1', id: '1' };

    const result = Utils.aggregateSensorLogs(logs);

    expect(result).toEqual(expectedResult);
  });

  it('returns null when passed no logs', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [];

    const result = Utils.aggregateSensorLogs(logs);

    expect(result).toBe(null);
  });

  it('throws an error when logs is not an array', () => {
    const Utils = new DatabaseUtilsService();

    let logs = null;

    expect(() => Utils.aggregateSensorLogs(logs)).toThrow(
      DATABASE_UTIL_ERROR.AGGREGATE_SENSOR_LOGS_INVALID_LOGS
    );

    logs = '';

    expect(() => Utils.aggregateSensorLogs(logs)).toThrow(
      DATABASE_UTIL_ERROR.AGGREGATE_SENSOR_LOGS_INVALID_LOGS
    );
  });

  it('throws an error when the sensor id of multiple logs is different', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 2, timestamp: 1, sensorId: '2', id: '2' },
      { temperature: 3, timestamp: 2, sensorId: '1', id: '3' },
    ];

    expect(() => Utils.aggregateSensorLogs(logs)).toThrowError(
      DATABASE_UTIL_ERROR.AGGREGATE_SENSOR_LOGS_INVALID_SENSOR_ID
    );
  });
  it('throws an error when a sensor log has no temperature', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [
      { timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 2, timestamp: 1, sensorId: '1', id: '2' },
      { temperature: 3, timestamp: 2, sensorId: '1', id: '3' },
    ];

    expect(() => Utils.aggregateSensorLogs(logs)).toThrowError(
      DATABASE_UTIL_ERROR.AGGREGATE_SENSOR_LOGS_INVALID_TEMPERATURE
    );
  });
  it('throws an error when a sensor log has no temperature', () => {
    const Utils = new DatabaseUtilsService();

    const logs = [
      { temperature: 1, sensorId: '1', id: '1' },
      { temperature: 2, timestamp: 1, sensorId: '1', id: '2' },
      { temperature: 3, timestamp: 2, sensorId: '1', id: '3' },
    ];

    expect(() => Utils.aggregateSensorLogs(logs)).toThrowError(
      DATABASE_UTIL_ERROR.AGGREGATE_SENSOR_LOGS_INVALID_TIMESTAMP
    );
  });
});

describe('DatabaseUtils: calculateSensorLogsPerTemperature', () => {
  it('calculates the number of sensor logs correctly', () => {
    const Utils = new DatabaseUtilsService();

    let logIntervalInSeconds = 300;
    let sizeOfTemperatureLogs = 1000 * 60 * 30;

    expect(
      Utils.calculateSensorLogsPerTemperatureLog(logIntervalInSeconds, sizeOfTemperatureLogs)
    ).toBe(6);

    logIntervalInSeconds = 600;
    sizeOfTemperatureLogs = 1000 * 60 * 30;

    expect(
      Utils.calculateSensorLogsPerTemperatureLog(logIntervalInSeconds, sizeOfTemperatureLogs)
    ).toBe(3);

    logIntervalInSeconds = 600.1;
    sizeOfTemperatureLogs = 1000 * 60 * 30;

    expect(
      Utils.calculateSensorLogsPerTemperatureLog(logIntervalInSeconds, sizeOfTemperatureLogs)
    ).toBe(3);
  });
  it('throws an error if either parameter is not a number', () => {
    const Utils = new DatabaseUtilsService();

    let logIntervalInSeconds = '';
    let sizeOfTemperatureLogs = 1000 * 60 * 30;

    expect(() =>
      Utils.calculateSensorLogsPerTemperatureLog(logIntervalInSeconds, sizeOfTemperatureLogs)
    ).toThrowError(DATABASE_UTIL_ERROR.CALCULATE_TEMPERATURE_LOG_SIZE_INVALID_NUMBER);

    logIntervalInSeconds = 300;
    sizeOfTemperatureLogs = '';

    expect(() =>
      Utils.calculateSensorLogsPerTemperatureLog(logIntervalInSeconds, sizeOfTemperatureLogs)
    ).toThrowError(DATABASE_UTIL_ERROR.CALCULATE_TEMPERATURE_LOG_SIZE_INVALID_NUMBER);
  });
  it('throws an error if size of temperature logs is 0', () => {
    const Utils = new DatabaseUtilsService();

    const logIntervalInSeconds = '';
    const sizeOfTemperatureLogs = 0;

    expect(() =>
      Utils.calculateSensorLogsPerTemperatureLog(logIntervalInSeconds, sizeOfTemperatureLogs)
    ).toThrowError(DATABASE_UTIL_ERROR.CALCULATE_TEMPERATURE_LOG_SIZE_INVALID_NUMBER);
  });
  it('throws an error if either number is less than 0', () => {
    const Utils = new DatabaseUtilsService();

    let logIntervalInSeconds = -1;
    let sizeOfTemperatureLogs = 300000;

    expect(() =>
      Utils.calculateSensorLogsPerTemperatureLog(logIntervalInSeconds, sizeOfTemperatureLogs)
    ).toThrowError(DATABASE_UTIL_ERROR.CALCULATE_TEMPERATURE_LOG_SIZE_INVALID_NUMBER);

    logIntervalInSeconds = 300000;
    sizeOfTemperatureLogs = -1;

    expect(() =>
      Utils.calculateSensorLogsPerTemperatureLog(logIntervalInSeconds, sizeOfTemperatureLogs)
    ).toThrowError(DATABASE_UTIL_ERROR.CALCULATE_TEMPERATURE_LOG_SIZE_INVALID_NUMBER);
  });
});

describe('DatabaseUtils: createTemperatureLogs', () => {
  it('takes a set of sensor logs and turns them into the correct number of temperature logs', () => {
    const Utils = new DatabaseUtilsService();

    let sensorLogs = [
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '2' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '3' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '2' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '3' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '2' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '3' },
    ];

    expect(Utils.createTemperatureLogs(sensorLogs, 3).length).toEqual(3);

    sensorLogs = [
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '2' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '3' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '4' },
    ];

    expect(Utils.createTemperatureLogs(sensorLogs, 2).length).toEqual(2);
  });
  it('only aggregates the correct number of sensor logs, leaving remainders unused', () => {
    const Utils = new DatabaseUtilsService();
    let sensorLogs = [
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '2' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '3' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '4' },
    ];
    expect(Utils.createTemperatureLogs(sensorLogs, 3).length).toEqual(1);

    sensorLogs = [
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '2' },
    ];
    expect(Utils.createTemperatureLogs(sensorLogs, 3).length).toEqual(0);
  });
  it('correctly returns the sensor logs which were aggregated alongside the temperature log', () => {
    const Utils = new DatabaseUtilsService();

    let sensorLogs = [{ temperature: 1, timestamp: 0, sensorId: '1', id: '1' }];
    let result = Utils.createTemperatureLogs(sensorLogs, 1);
    expect(result[0].sensorLogs).toEqual(sensorLogs);

    sensorLogs = [
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
      { temperature: 1, timestamp: 0, sensorId: '1', id: '1' },
    ];
    result = Utils.createTemperatureLogs(sensorLogs, 1);
    expect(result[0].sensorLogs).toEqual([sensorLogs[0]]);
    expect(result[1].sensorLogs).toEqual([sensorLogs[1]]);
  });
  it('handles being passed no logs by returning an empty array', () => {
    const Utils = new DatabaseUtilsService();

    const sensorLogs = [];
    const result = Utils.createTemperatureLogs(sensorLogs, 1);

    expect(result).toEqual([]);
  });
  it('handles being passed the number of sensor logs per temperature log higher than the number of logs passed by returning an empty array', () => {
    const Utils = new DatabaseUtilsService();

    const sensorLogs = [{ temperature: 1, timestamp: 0, sensorId: '1', id: '1' }];
    const result = Utils.createTemperatureLogs(sensorLogs, 2);
    expect(result).toEqual([]);
  });
  it('throws an error when passed a number of sensor logs per temperature log which is not a number', () => {
    const Utils = new DatabaseUtilsService();

    const sensorLogs = [{ temperature: 1, timestamp: 0, sensorId: '1', id: '1' }];

    expect(() => Utils.createTemperatureLogs(sensorLogs, '')).toThrowError(
      DATABASE_UTIL_ERROR.CREATE_TEMPERATURE_LOGS_INVALID_NUMBER
    );
  });
  it('throws an error if the sensor logs passed is not an array', () => {
    const Utils = new DatabaseUtilsService();

    expect(() => Utils.createTemperatureLogs('', 1)).toThrowError(
      DATABASE_UTIL_ERROR.CREATE_TEMPERATURE_LOGS_INVALID_LOGS
    );
  });
  it('throws an error if a sensor log within the sensor logs being passed is malformed ', () => {
    const Utils = new DatabaseUtilsService();

    expect(() => Utils.createTemperatureLogs([{}], 1)).toThrowError();
  });
});

describe('DatabaseUtilsService: closeBreach', () => {
  it('returns a temperatureBreach object with a end timestamp set to the time now', () => {
    const Utils = new DatabaseUtilsService();
    const breach = { startTimestamp: moment(0) };
    const timeNow = moment();

    expect(Utils.closeBreach(breach, timeNow.unix()).endTimestamp).toEqual(timeNow.unix());
  });
  it('throws an error if the temperature breach is not an object.', () => {
    const Utils = new DatabaseUtilsService();
    const breach = null;

    expect(() => Utils.closeBreach(breach)).toThrow(
      DATABASE_UTIL_ERROR.CLOSE_BREACH_INVALID_BREACH
    );
  });
  it('throws an error if the temperature breach already has an end timestamp set.', () => {
    const Utils = new DatabaseUtilsService();
    const breach = { endTimestamp: moment() };

    expect(() => Utils.closeBreach(breach)).toThrow(DATABASE_UTIL_ERROR.CLOSE_BREACH_HAS_END_TIME);
  });
});

describe('DatabaseUtilsService: createBreach', () => {
  it('returns a temperature breach record', () => {
    const Utils = new DatabaseUtilsService();

    const sensor = { id: '1' };
    const config = { id: 'a' };

    const startTimestamp = moment(0).unix();
    const shouldBe = {
      id: '1',
      temperatureBreachConfigurationId: 'a',
      sensorId: '1',
      startTimestamp,
      temperatureBreachConfiguration: config,
    };

    const result = Utils.createBreach(sensor, config, startTimestamp);

    expect(result).toEqual(shouldBe);
  });
  it('throws an error if the configuration past is null or has no id', () => {
    const Utils = new DatabaseUtilsService();

    const sensor = { id: '1' };

    const startTimestamp = moment(0).unix();

    expect(() => Utils.createBreach(sensor, null, startTimestamp)).toThrowError(
      DATABASE_UTIL_ERROR.CREATE_BREACH_INVALID_CONFIG
    );

    expect(() => Utils.createBreach(sensor, {}, startTimestamp)).toThrowError(
      DATABASE_UTIL_ERROR.CREATE_BREACH_INVALID_CONFIG
    );
  });
  it('throws an error if the sensor passed is null or has no id', () => {
    const Utils = new DatabaseUtilsService();

    const config = { id: 'a' };

    const startTimestamp = moment(0).unix();

    expect(() => Utils.createBreach(null, config, startTimestamp)).toThrowError(
      DATABASE_UTIL_ERROR.CREATE_BREACH_INVALID_SENSOR
    );

    expect(() => Utils.createBreach({}, config, startTimestamp)).toThrowError(
      DATABASE_UTIL_ERROR.CREATE_BREACH_INVALID_SENSOR
    );
  });
});

describe('DatabaseUtilsService: willCreateBreach', () => {
  it('correctly returns false when a breach should be made for a simple case.', () => {
    const Utils = new DatabaseUtilsService();

    let config = { minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    let logs = [
      { temperature: 1, timestamp: 0 },
      { temperature: 1, timestamp: 1 },
      { temperature: 1, timestamp: 2 },
    ];

    expect(Utils.willCreateBreach(config, logs)).toBe(true);

    config = { minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    logs = [
      { temperature: 8, timestamp: 0 },
      { temperature: 9, timestamp: 1 },
      { temperature: 10, timestamp: 2 },
    ];

    expect(Utils.willCreateBreach(config, logs)).toBe(true);
  });
  it('correctly returns that a breach should be made when the duration is well over the duration required', () => {
    const Utils = new DatabaseUtilsService();

    let config = { minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    let logs = [
      { temperature: 1, timestamp: 0 },
      { temperature: 1, timestamp: 1 },
      { temperature: 1, timestamp: 2 },
      { temperature: 1, timestamp: 100 },
    ];

    expect(Utils.willCreateBreach(config, logs)).toBe(true);

    config = { minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    logs = [
      { temperature: 8, timestamp: 1000 },
      { temperature: 8, timestamp: 1001 },
      { temperature: 8, timestamp: 1002 },
      { temperature: 8, timestamp: 2000 },
    ];

    expect(Utils.willCreateBreach(config, logs)).toBe(true);
  });
  it('correctly returns that a breach should be made when the temperatures vary a lot', () => {
    const Utils = new DatabaseUtilsService();
    let config = { minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    let logs = [
      { temperature: -999, timestamp: 0 },
      { temperature: 2, timestamp: 1 },
      { temperature: -999, timestamp: 2 },
      { temperature: 2, timestamp: 100 },
    ];

    expect(Utils.willCreateBreach(config, logs)).toBe(true);

    config = { minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    logs = [
      { temperature: 8, timestamp: 0 },
      { temperature: 999, timestamp: 1 },
      { temperature: 8, timestamp: 2 },
      { temperature: 999, timestamp: 100 },
    ];

    expect(Utils.willCreateBreach(config, logs)).toBe(true);
  });
  it('correctly returns that a breach should not be made when the temperatures are not all within the bounds', () => {
    const Utils = new DatabaseUtilsService();
    let config = { minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    let logs = [
      { temperature: -999, timestamp: 0 },
      { temperature: 1, timestamp: 1 },
      { temperature: -999, timestamp: 2 },
      { temperature: 2, timestamp: 100 },
    ];

    expect(Utils.willCreateBreach(config, logs)).toBe(true);

    config = { minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    logs = [
      { temperature: 8, timestamp: 0 },
      { temperature: 999, timestamp: 1 },
      { temperature: 8, timestamp: 2 },
      { temperature: 1000, timestamp: 100 },
    ];

    expect(Utils.willCreateBreach(config, logs)).toBe(false);
  });
  it('correctly returns that a breach should not be made when the duration is not exceeded', () => {
    const Utils = new DatabaseUtilsService();

    const config = { minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const logs = [
      { temperature: -999, timestamp: 0 },
      { temperature: 1, timestamp: 1 },
    ];

    expect(Utils.willCreateBreach(config, logs)).toBe(false);
  });
  it('throws an error when the config passed is invalid', () => {
    const Utils = new DatabaseUtilsService();

    const config = null;
    const logs = [
      { temperature: -999, timestamp: 0 },
      { temperature: 1, timestamp: 1 },
    ];

    expect(() => Utils.willCreateBreach(config, logs)).toThrowError(
      DATABASE_UTIL_ERROR.WILL_CREATE_BREACH_INVALID_CONFIG
    );
  });
  it('throws an error when the logs passed is not an array', () => {
    const Utils = new DatabaseUtilsService();

    const config = { minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const logs = {};

    expect(() => Utils.willCreateBreach(config, logs)).toThrowError(
      DATABASE_UTIL_ERROR.WILL_CREATE_BREACH_INVALID_LOGS
    );
  });
  it('throws an error when any log passed does not have a timestamp or temperature', () => {
    const Utils = new DatabaseUtilsService();

    const config = { minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const logs = [{}];

    expect(() => Utils.willCreateBreach(config, logs)).toThrowError(
      DATABASE_UTIL_ERROR.WILL_CREATE_BREACH_INVALID_LOG
    );
  });
});

describe('DatabaseUtilsService: addLogToBreach', () => {
  it('returns the log added to the breach', () => {
    const Utils = new DatabaseUtilsService();

    const breach = { id: 'breach' };
    const log = { field: 'a' };
    const shouldBe = { field: 'a', temperatureBreachId: 'breach' };

    expect(Utils.addLogToBreach(breach, log)).toEqual(shouldBe);
  });
  it('throws an error if a temperature breach is invalid', () => {
    const Utils = new DatabaseUtilsService();

    let breach = null;
    const log = { field: 'a' };

    expect(() => Utils.addLogToBreach(breach, log)).toThrowError(
      DATABASE_UTIL_ERROR.ADD_LOG_TO_BREACH_INVALID_BREACH
    );

    breach = {};

    expect(() => Utils.addLogToBreach(breach, log)).toThrowError(
      DATABASE_UTIL_ERROR.ADD_LOG_TO_BREACH_INVALID_BREACH
    );
  });
  it('throws an error if the temperature log is already in a breach', () => {
    const Utils = new DatabaseUtilsService();

    let breach = { id: 'breach' };
    let log = { field: 'a', temperatureBreachId: 'breach' };

    expect(() => Utils.addLogToBreach(breach, log)).toThrowError(
      DATABASE_UTIL_ERROR.ADD_LOG_TO_BREACH_LOG_ALREADY_BREACHED
    );

    breach = { id: 'breach' };
    log = { field: 'a', temperatureBreachId: 'breach2' };

    expect(() => Utils.addLogToBreach(breach, log)).toThrowError(
      DATABASE_UTIL_ERROR.ADD_LOG_TO_BREACH_LOG_ALREADY_BREACHED
    );
  });
});

describe('DatabaseUtilsService: willContinueBreach', () => {
  it('returns true if the breach will be continued by the log', () => {
    const Utils = new DatabaseUtilsService();

    let maximumTemperature = 999;
    let minimumTemperature = 8;
    let temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    let breach = { temperatureBreachConfiguration };
    let log = { temperature: 8 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(true);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 2 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(true);

    maximumTemperature = 999;
    minimumTemperature = 8;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 999 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(true);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: -999 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(true);

    maximumTemperature = 999;
    minimumTemperature = 8;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 20 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(true);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: -20 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(true);
  });
  it('returns false if the breach will not be continued by the log', () => {
    const Utils = new DatabaseUtilsService();

    let maximumTemperature = 999;
    let minimumTemperature = 8;
    let temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    let breach = { temperatureBreachConfiguration };
    let log = { temperature: 7 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(false);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 3 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(false);

    maximumTemperature = 999;
    minimumTemperature = 8;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 1000 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(false);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: -1000 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(false);

    maximumTemperature = 999;
    minimumTemperature = 8;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: -20 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(false);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 20 };

    expect(Utils.willContinueBreach(breach, log)).toEqual(false);
  });
});

describe('DatabaseUtilsService: willCloseBreach', () => {
  it('returns false if the log should not close the breach', () => {
    const Utils = new DatabaseUtilsService();

    let maximumTemperature = 999;
    let minimumTemperature = 8;
    let temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    let breach = { temperatureBreachConfiguration };
    let log = { temperature: 8 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(false);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 2 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(false);

    maximumTemperature = 999;
    minimumTemperature = 8;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 999 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(false);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: -999 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(false);

    maximumTemperature = 999;
    minimumTemperature = 8;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 20 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(false);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: -20 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(false);
  });
  it('returns true if it should close the breach', () => {
    const Utils = new DatabaseUtilsService();

    let maximumTemperature = 999;
    let minimumTemperature = 8;
    let temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    let breach = { temperatureBreachConfiguration };
    let log = { temperature: 7 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(true);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 3 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(true);

    maximumTemperature = 999;
    minimumTemperature = 8;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 1000 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(true);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: -1000 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(true);

    maximumTemperature = 999;
    minimumTemperature = 8;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: -20 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(true);

    maximumTemperature = 2;
    minimumTemperature = -999;
    temperatureBreachConfiguration = { maximumTemperature, minimumTemperature };
    breach = { temperatureBreachConfiguration };
    log = { temperature: 20 };

    expect(Utils.willCloseBreach(breach, log)).toEqual(true);
  });
});

describe('DatabaseUtilsService: willCreateBreachFromConfigs', () => {
  it('returns true with the config for the breach which should be made from the logs passed', () => {
    const Utils = new DatabaseUtilsService();

    const configOne = { id: 'a', minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    const configTwo = { id: 'b', minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const configs = [configOne, configTwo];

    const logOne = { id: 'a', temperature: 9, timestamp: 0 };
    const logTwo = { id: 'b', temperature: 9, timestamp: 1 };
    const logThree = { id: 'c', temperature: 9, timestamp: 2 };
    const logs = [logOne, logTwo, logThree];

    const result = [true, configOne];

    expect(Utils.willCreateBreachFromConfigs(configs, logs)).toEqual(result);
  });
  it('returns false if no breach should be made.', () => {
    const Utils = new DatabaseUtilsService();

    const configOne = { id: 'a', minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    const configTwo = { id: 'b', minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const configs = [configOne, configTwo];

    const logOne = { id: 'a', temperature: 3, timestamp: 0 };
    const logTwo = { id: 'b', temperature: 3, timestamp: 1 };
    const logThree = { id: 'c', temperature: 3, timestamp: 2 };
    const logs = [logOne, logTwo, logThree];

    const result = [false, undefined];

    expect(Utils.willCreateBreachFromConfigs(configs, logs)).toEqual(result);
  });
});

describe('DatabaseUtilsService: createBreaches', () => {
  it('returns the temperature logs updated with the breaches they are in correctly in a basic case', () => {
    const Utils = new DatabaseUtilsService();

    const sensor = { id: 'sensor' };

    const configOne = { id: 'a', minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    const configTwo = { id: 'b', minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const configs = [configOne, configTwo];

    const logOne = { id: 'a', temperature: 8, timestamp: 0 };
    const logTwo = { id: 'b', temperature: 8, timestamp: 1 };
    const logThree = { id: 'c', temperature: 8, timestamp: 2 };

    const logFour = { id: 'd', temperature: 2, timestamp: 3 };
    const logFive = { id: 'e', temperature: 2, timestamp: 4 };
    const logSix = { id: 'f', temperature: 2, timestamp: 5 };

    const logs = [logOne, logTwo, logThree, logFour, logFive, logSix];

    const logsShouldBe = [
      { ...logOne, temperatureBreachId: '1' },
      { ...logTwo, temperatureBreachId: '1' },
      { ...logThree, temperatureBreachId: '1' },
      { ...logFour, temperatureBreachId: '1' },
      { ...logFive, temperatureBreachId: '1' },
      { ...logSix, temperatureBreachId: '1' },
    ];

    const temperatureBreaches = [
      {
        id: '1',
        temperatureBreachConfigurationId: 'a',
        temperatureBreachConfiguration: configOne,
        startTimestamp: 0,
        endTimestamp: 2,
        sensorId: 'sensor',
      },
      {
        id: '1',
        temperatureBreachConfigurationId: 'b',
        temperatureBreachConfiguration: configTwo,
        startTimestamp: 3,
        sensorId: 'sensor',
      },
    ];

    expect(Utils.cBreaches(sensor, logs, configs)).toEqual([temperatureBreaches, logsShouldBe]);
  });
  it('correctly creates breaches when there is a gap in the middle of the sequential logs', () => {
    const Utils = new DatabaseUtilsService();

    const sensor = { id: 'sensor' };

    const configOne = { id: 'a', minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    const configTwo = { id: 'b', minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const configs = [configOne, configTwo];

    const logOne = { id: 'a', temperature: 8, timestamp: 0 };
    const logTwo = { id: 'b', temperature: 8, timestamp: 1 };
    const logThree = { id: 'c', temperature: 8, timestamp: 2 };

    const logFour = { id: 'd', temperature: 3, timestamp: 3 };

    const logFive = { id: 'e', temperature: 2, timestamp: 4 };
    const logSix = { id: 'f', temperature: 2, timestamp: 5 };
    const logSeven = { id: 'g', temperature: 2, timestamp: 6 };

    const logs = [logOne, logTwo, logThree, logFour, logFive, logSix, logSeven];

    const logsShouldBe = [
      { ...logOne, temperatureBreachId: '1' },
      { ...logTwo, temperatureBreachId: '1' },
      { ...logThree, temperatureBreachId: '1' },

      { ...logFive, temperatureBreachId: '1' },
      { ...logSix, temperatureBreachId: '1' },
      { ...logSeven, temperatureBreachId: '1' },
    ];

    const temperatureBreaches = [
      {
        id: '1',
        temperatureBreachConfigurationId: 'a',
        temperatureBreachConfiguration: configOne,
        startTimestamp: 0,
        endTimestamp: 2,
        sensorId: 'sensor',
      },
      {
        id: '1',
        temperatureBreachConfigurationId: 'b',
        temperatureBreachConfiguration: configTwo,
        startTimestamp: 4,
        sensorId: 'sensor',
      },
    ];

    expect(Utils.cBreaches(sensor, logs, configs)).toEqual([temperatureBreaches, logsShouldBe]);
  });
  it('cancels a breach creation process when there is insufficient duration', () => {
    const Utils = new DatabaseUtilsService();

    const sensor = { id: 'sensor' };

    const configOne = { id: 'a', minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    const configTwo = { id: 'b', minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const configs = [configOne, configTwo];

    const logOne = { id: 'a', temperature: 8, timestamp: 0 };
    const logTwo = { id: 'b', temperature: 8, timestamp: 1 };
    const logThree = { id: 'c', temperature: 8, timestamp: 2 };

    const logFour = { id: 'd', temperature: 3, timestamp: 3 };

    const logFive = { id: 'e', temperature: 2, timestamp: 4 };
    const logSix = { id: 'f', temperature: 3, timestamp: 5 };
    const logSeven = { id: 'g', temperature: 2, timestamp: 6 };

    const logs = [logOne, logTwo, logThree, logFour, logFive, logSix, logSeven];

    const logsShouldBe = [
      { ...logOne, temperatureBreachId: '1' },
      { ...logTwo, temperatureBreachId: '1' },
      { ...logThree, temperatureBreachId: '1' },
    ];

    const temperatureBreaches = [
      {
        id: '1',
        temperatureBreachConfigurationId: 'a',
        temperatureBreachConfiguration: configOne,
        startTimestamp: 0,
        endTimestamp: 2,
        sensorId: 'sensor',
      },
    ];

    expect(Utils.cBreaches(sensor, logs, configs)).toEqual([temperatureBreaches, logsShouldBe]);
  });
});

describe('DatabaseUtilsService: couldBeInBreach', () => {
  it('returns true when the log is within the breach temperature range', () => {
    const Utils = new DatabaseUtilsService();

    const configOne = { id: 'a', minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    const configTwo = { id: 'b', minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const configs = [configOne, configTwo];

    let log = { temperature: 8 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(true);

    log = { temperature: 9 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(true);

    log = { temperature: 999 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(true);

    log = { temperature: 998 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(true);

    log = { temperature: 2 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(true);

    log = { temperature: 1 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(true);

    log = { temperature: -999 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(true);

    log = { temperature: -998 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(true);
  });
  it('returns false when the log is not within the breach temperature range', () => {
    const Utils = new DatabaseUtilsService();

    const configOne = { id: 'a', minimumTemperature: 8, maximumTemperature: 999, duration: 2 };
    const configTwo = { id: 'b', minimumTemperature: -999, maximumTemperature: 2, duration: 2 };
    const configs = [configOne, configTwo];

    let log = { temperature: 7 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(false);

    log = { temperature: 1000 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(false);

    log = { temperature: 3 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(false);

    log = { temperature: -1000 };
    expect(Utils.couldBeInBreach(log, configs)).toBe(false);
  });
});
