import DependencyLocator from '~services/DependencyLocator/DependencyLocator';
import { Sensor } from '~services/Database';
import { BLUE_MAESTRO } from '~constants';
import { SensorLog } from '@openmsupply/msupply-ble-service';

import { NativeModules } from 'react-native';

type SensorRequest = {
  event: 'SENSORS_REQUEST';
};
type AdvertReceiveEvent = {
  event: 'ADVERT_RECEIVE';
  deviceAddress: string;
  data: Int8Array;
};
type LogAllEvent = {
  event: 'LOGALL_RECEIVE';
  deviceAddress: string;
  data: string[];
};

type ScanEvent = SensorRequest | AdvertReceiveEvent | LogAllEvent;

const ADVERT_CURR_TEMP_OFFSET = 13;
const LOGALL_FETCH_PERIOD = 1000 * 60 * 10; // 10 minutes

module.exports = async (eventData: ScanEvent) => {
  const logger = DependencyLocator.get('loggerService');
  const utils = DependencyLocator.get('utilService');
  const downloadManager = DependencyLocator.get('downloadManager');
  const sensorManager = DependencyLocator.get('sensorManager');

  if (eventData.event === 'SENSORS_REQUEST') {
    const { BluetoothScannerModule } = NativeModules;
    const sensors: Sensor[] = await sensorManager.getAll();
    for (const currSensor of sensors) {
      BluetoothScannerModule.registerSensor(currSensor.macAddress);
    }
  } else if (eventData.event === 'ADVERT_RECEIVE') {
    const { deviceAddress, data } = eventData;
    const sensor = sensorManager.getSensorByMac(deviceAddress);

    // Get currentTemperature entry from advertisement packet
    const temperature =
      // eslint-disable-next-line no-bitwise
      (((data[ADVERT_CURR_TEMP_OFFSET] & 0xff) << 8) | (data[ADVERT_CURR_TEMP_OFFSET + 1] & 0xff)) /
      10.0;

    const mostRecentLogTime = sensorManager.getMostRecentLogTime(sensor.id);
    const currentTime = utils.now();

    if (currentTime - mostRecentLogTime > LOGALL_FETCH_PERIOD) {
      const { BluetoothScannerModule } = NativeModules;
      BluetoothScannerModule.setLogRequested(sensor.id);
    }

    downloadManager.createLogs(
      [
        {
          id: sensor.id,
          temperature: temperature,
        },
      ],
      sensor,
      1, // Save one log
      sensorManager.getMostRecentLogTime(sensor.id)
    );
  } else if (eventData.event === 'LOGALL_RECEIVE') {
    const { deviceAddress, data } = eventData;
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
          {
            time: '',
            temperature: buffer.readInt16BE(index) / BLUE_MAESTRO.TEMPERATURE_DIVISOR,
          },
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
  }
};
