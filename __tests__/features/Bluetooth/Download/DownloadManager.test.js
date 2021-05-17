import { DownloadManager } from '~features/Bluetooth/Download';
import { UtilService } from '~common/services/UtilService';

describe('DownloadManager: calculateNumberOfLogsToSave', () => {
  it('Calculates correctly when the next possible log time is less than the time now', () => {
    const downloadManager = new DownloadManager();

    let nextPossibleLogTime = 0;
    let logInterval = 300;
    let timeNow = 600;

    // Can download logs for 0, 300 & 600.
    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(3);

    nextPossibleLogTime = 0;
    logInterval = 300;
    timeNow = 599;

    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(2);
  });
  it('Calculates correctly when the next Download time is after the time now', () => {
    const downloadManager = new DownloadManager();

    let nextPossibleLogTime = 300;
    let logInterval = 300;
    let timeNow = 299;

    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(0);

    nextPossibleLogTime = 1;
    logInterval = 300;
    timeNow = 0;

    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(0);
  });

  it('Calculates correctly using the log interval for additional logs', () => {
    const downloadManager = new DownloadManager();

    let nextPossibleLogTime = 0;
    let logInterval = 300;
    let timeNow = 301;

    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(2);

    nextPossibleLogTime = 0;
    logInterval = 300;
    timeNow = 599;

    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(2);
  });
});

describe('DownloadManager: createLogs', () => {
  it('Creates the correct logs starting from no existing logs.', () => {
    const utils = new UtilService();
    const downloadManager = new DownloadManager({}, utils);

    const sensor = { id: 'a', logInterval: 300 };
    const maxNumberToSave = 3;
    const mostRecentLogTime = null;
    const timeNow = 600;

    const logs = [{ temperature: 10 }, { temperature: 11 }, { temperature: 12 }];
    const shouldBe = [
      { id: '1', temperature: 10, timestamp: 0, sensorId: 'a', logInterval: 300 },
      { id: '1', temperature: 11, timestamp: 300, sensorId: 'a', logInterval: 300 },
      { id: '1', temperature: 12, timestamp: 600, sensorId: 'a', logInterval: 300 },
    ];

    expect(
      downloadManager.createLogs(logs, sensor, maxNumberToSave, mostRecentLogTime, timeNow)
    ).toEqual(shouldBe);
  });
  it('Creates the correct logs when there are existing logs', () => {
    const utils = new UtilService();
    const downloadManager = new DownloadManager({}, utils);

    const sensor = { id: 'a', logInterval: 300 };
    const maxNumberToSave = 2;
    const mostRecentLogTime = 0;
    const timeNow = 600;

    const logs = [{ temperature: 10 }, { temperature: 11 }, { temperature: 12 }];
    const shouldBe = [
      { id: '1', temperature: 11, timestamp: 300, sensorId: 'a', logInterval: 300 },
      { id: '1', temperature: 12, timestamp: 600, sensorId: 'a', logInterval: 300 },
    ];

    expect(
      downloadManager.createLogs(logs, sensor, maxNumberToSave, mostRecentLogTime, timeNow)
    ).toEqual(shouldBe);
  });

  it('Calls the db service with the passed logs', async () => {
    const mockUpsert = jest.fn((_, entities) => {
      return entities;
    });

    const mockDbService = { insert: mockUpsert };
    const downloadManager = new DownloadManager(mockDbService);

    const logs = [{ id: '1', temperature: 10, timestamp: 600, sensorId: 'a', logInterval: 300 }];
    const result = await downloadManager.saveLogs(logs);
    expect(result).toEqual(logs);
  });
  it('Creates logs with the correct timestamps when there exists other most recent logs.', () => {
    const dbService = {};
    const utils = { uuid: () => '1' };
    const downloadManager = new DownloadManager(dbService, utils);

    const sensor = { id: 'a', logInterval: 300 };
    const maxNumberToSave = 1;
    const mostRecentLogTime = 1;
    const timeNow = 600;

    // In this case, there already exists a record that's been recorded at 1. So there can only
    // be one record that exists that we have not downloaded and saved - the record at 301 - given
    // the logging interval of 300 and the time now @ 600 (with the next record being due at 601).
    const logs = [{ temperature: 10 }, { temperature: 11 }, { temperature: 12 }];
    const shouldBe = [
      {
        id: '1',
        temperature: 12,
        timestamp: 301,
        sensorId: sensor.id,
        logInterval: 300,
      },
    ];

    expect(
      downloadManager.createLogs(logs, sensor, maxNumberToSave, mostRecentLogTime, timeNow)
    ).toEqual(shouldBe);
  });
  it('Correctly calculates the timestamp of a sensor when there is a gap of logs', () => {
    // We are mocking the case where the sensor has been taken away and used elsewhere, for some reason.
    // This sensor is returning a few days later with only a few logs (they were deleted elsewhere).
    // In this case, we should be calculating timestamps backwards from now, rather than counting
    // forward from the saved timestamps.

    // Mocks
    const dbService = {};
    const utils = { uuid: () => '1' };
    const downloadManager = new DownloadManager(dbService, utils);
    const sensor = { id: 'a', logInterval: 300 };

    // Important numbers!

    // We can save heaps of logs
    const maxNumberToSave = 100;
    // The most recent log we have saved is here.
    const mostRecentLogTime = 1000;
    // The time now though, is 100 log intervals into the future.
    const timeNow = mostRecentLogTime + 100 * 300;
    // Then, when we downloaded the logs, we only got two of them.
    const logs = [{ temperature: 10 }, { temperature: 11 }];

    // So when we save these two logs we downloaded, we should save them at
    // timeNow and timeNow - logInterval
    const shouldBe = [
      {
        id: '1',
        temperature: 10,
        timestamp: timeNow - sensor.logInterval,
        sensorId: sensor.id,
        logInterval: sensor.logInterval,
      },
      {
        id: '1',
        temperature: 11,
        timestamp: timeNow,
        sensorId: sensor.id,
        logInterval: sensor.logInterval,
      },
    ];

    expect(
      downloadManager.createLogs(
        logs,
        sensor,
        Math.min(maxNumberToSave, shouldBe.length),
        mostRecentLogTime,
        timeNow
      )
    ).toEqual(shouldBe);
  });
});
