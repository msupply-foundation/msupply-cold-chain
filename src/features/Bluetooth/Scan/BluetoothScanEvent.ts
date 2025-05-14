import DependencyLocator from '~services/DependencyLocator/DependencyLocator';
import { BLUE_MAESTRO } from '~services/Bluetooth';
import { SensorLog } from '~services/Bluetooth/types';

type ScanEvent = {
  event: string;
  deviceAddress: string;
  data: string[];
};

module.exports = async (eventData: ScanEvent) => {
  const { event, deviceAddress, data } = eventData;
  const logger = DependencyLocator.get('loggerService');
  const utils = DependencyLocator.get('utilService');
  const downloadManager = DependencyLocator.get('downloadManager');
  const sensorManager = DependencyLocator.get('sensorManager');
  // Do stuff here when we add actual data
  switch (event) {
    case 'SENSORS_REQUEST':
      // TODO: Pull sensors from database, send them through to java module
      break;
    case 'ADVERT_RECEIVE':
      // TODO: Parse advert data, save to database
      break;
    case 'LOGALL_RECEIVE':
      // TODO: Check if these formats match
      const sensor = sensorManager.getSensorByMac(deviceAddress);

      logger.info(`${deviceAddress} Write and monitor found some data! ${data.length}`);
      logger.debug(`${deviceAddress} ${data.join('; ')}`);
      const buffer = Buffer.concat(data.slice(1).map(datum => utils.bufferFromBase64(datum)));
      const ind = buffer.findIndex(
        (_, i) =>
          (i % 2 === 0 && buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_A) ||
          buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_B
      );

      const parsedLogs: SensorLog[] = (buffer.slice(0, ind) as Buffer).reduce(
        (acc: SensorLog[], _, index) => {
          if (index % 2 !== 0) return acc;
          return [
            ...acc,
            { time: '', temperature: buffer.readInt16BE(index) / BLUE_MAESTRO.TEMPERATURE_DIVISOR },
          ];
        },
        []
      );

      const { id: sensorId, logInterval, logDelay, programmedDate } = sensor;
      const mostRecentLogTime = sensorManager.getMostRecentLogTime(sensorId);
      const numberOfLogsToSave = downloadManager.calculateNumberOfLogsToSave(
        Math.max(mostRecentLogTime + logInterval, logDelay, programmedDate),
        logInterval
      );
      downloadManager.createLogs(
        parsedLogs,
        sensor,
        Math.min(numberOfLogsToSave, parsedLogs?.length),
        mostRecentLogTime
      );

      break;
  }
};
