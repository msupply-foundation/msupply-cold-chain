import { DownloadManager } from '~features/Bluetooth/Download';

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

    const nextPossibleLogTime = 300;
    const logInterval = 300;
    const timeNow = 299;

    expect(
      downloadManager.calculateNumberOfLogsToSave(nextPossibleLogTime, logInterval, timeNow)
    ).toBe(0);
  });
});
