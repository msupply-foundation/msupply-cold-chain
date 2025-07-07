import DependencyLocator from '~services/DependencyLocator/DependencyLocator';
import { Sensor } from '~services/Database';
import { BLUE_MAESTRO } from '~constants';
import { SensorLog } from '@openmsupply/msupply-ble-service';
import { store } from '~common/store';
import { SensorStatusAction } from '~features/SensorStatus';
import { ConsecutiveBreachAction, CumulativeBreachAction } from '~features';

import { NativeModules } from 'react-native';

type SensorRequest = {
  event: 'SENSORS_REQUEST';
};
type AdvertReceiveEvent = {
  event: 'ADVERT_RECEIVE';
  deviceName: string;
  data: string;
};
type LogAllEvent = {
  event: 'LOGALL_RECEIVE';
  deviceName: string;
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

  logger.info(`Received bluetooth event: ${eventData.event}`);
  console.log(`Received bluetooth event: ${eventData.event}`);

  if (eventData.event === 'SENSORS_REQUEST') {
    const { BluetoothScannerModule } = NativeModules;
    const sensors: Sensor[] = await sensorManager.getAll();
    for (const currSensor of sensors) {
      BluetoothScannerModule.registerSensor(currSensor.name, currSensor.macAddress);
    }
  } else if (eventData.event === 'ADVERT_RECEIVE') {
    const { deviceName, data } = eventData;
    const sensor = await sensorManager.getSensorByName(deviceName);

    const buffer = utils.bufferFromBase64(data);

    // Get currentTemperature entry from advertisement packet
    const temperature =
      (((buffer[ADVERT_CURR_TEMP_OFFSET] & 0xff) << 8) | // eslint-disable-line no-bitwise
        (buffer[ADVERT_CURR_TEMP_OFFSET + 1] & 0xff)) / // eslint-disable-line no-bitwise
      10.0;

    const mostRecentLogTime = sensorManager.getMostRecentLogTime(sensor.id);
    const currentTime = utils.now();

    if (currentTime - mostRecentLogTime > LOGALL_FETCH_PERIOD) {
      const { BluetoothScannerModule } = NativeModules;
      BluetoothScannerModule.setLogRequested(sensor.id);
    } else {
      // Don't attempt to save the advert log if we're going to logall anyway
      // it messes witht the calculation for how many logs to save
      await downloadManager.saveLogs(
        downloadManager.createLogs(
          [
            {
              id: sensor.id,
              temperature: temperature,
            },
          ],
          sensor,
          1, // Save one log
          await sensorManager.getMostRecentLogTime(sensor.id)
        )
      );

      // Dispatch Redux action to update UI
      store.dispatch(SensorStatusAction.fetch(sensor.id));
      store.dispatch(ConsecutiveBreachAction.create(sensor));
    }
  } else if (eventData.event === 'LOGALL_RECEIVE') {
    const { deviceName, data } = eventData;
    const sensor = await sensorManager.getSensorByName(deviceName);

    logger.info(`${deviceName} Write and monitor found some data! ${data.length}`);
    logger.debug(`${deviceName} ${data.join('; ')}`);
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
    const mostRecentLogTime = await sensorManager.getMostRecentLogTime(sensorId);
    const numberOfLogsToSave = downloadManager.calculateNumberOfLogsToSave(
      Math.max(mostRecentLogTime + logInterval, logDelay, programmedDate),
      logInterval
    );
    await downloadManager.saveLogs(
      downloadManager.createLogs(
        parsedLogs,
        sensor,
        Math.min(numberOfLogsToSave, parsedLogs?.length),
        mostRecentLogTime
      )
    );

    // Dispatch Redux actions to update UI after processing LOGALL data
    store.dispatch(SensorStatusAction.fetch(sensor.id));
    store.dispatch(ConsecutiveBreachAction.create(sensor));
    store.dispatch(CumulativeBreachAction.fetchListForSensor(sensor.id));
  }
};
