import { ToastAndroid } from 'react-native';
import { eventChannel } from 'redux-saga';
import {
  take,
  call,
  delay,
  takeLeading,
  put,
  fork,
  race,
  cancel,
  getContext,
  takeEvery,
  cancelled,
} from 'redux-saga/effects';
import {
  PassiveBluetoothActions,
  BluetoothStateActions,
  UpdateSensorAction,
} from './bluetoothSlice';
import { t } from '~translations';
import { SensorAction } from '~sensor';
import { SETTING, SERVICES, BLUETOOTH_SERVICE } from '~constants';
import { TemperatureLogActions } from '~database/DatabaseSlice';

/**
 * Initiates a specific scan for a sensor to download all
 * logs.
 */
export function* downloadTemperaturesForSensor(action) {
  const { payload } = action;
  const { macAddress } = payload;

  const getService = yield getContext('getService');
  const btService = yield call(getService, SERVICES.BLUETOOTH);

  const logs = yield call(btService.downloadLogs, 'DB:56:07:61:C7:13');

  yield put(TemperatureLogActions.saveSensorLogs(logs, macAddress));
}

/**
 * Starts a long running process of downloading temperatures from all ...
 * ... sensors which are saved in the database.
 *
 */
export function* downloadTemperatures() {
  const getService = yield getContext('getService');
  const dbService = yield call(getService, SERVICES.DATABASE);
  const sensors = yield call(dbService.getSensors);

  yield* sensors.map(({ macAddress }) =>
    put(BluetoothStateActions.downloadTemperaturesForSensor(macAddress))
  );
}

/**
 * Initiates a scan for sensors, returning their advertisement packets.
 */
export function* scanForSensors() {
  const getService = yield getContext('getService');
  const btService = yield call(getService, SERVICES.BLUETOOTH);

  const result = yield call(btService.scanForDevices);

  yield put(SensorAction.saveSensors(result));
}

/**
 * Starts some bluetooth action - download temperatures or scanning   ...
 * ... for sensors. Blocks during one of these process'
 */
export function* startBluetooth(action) {
  yield put(BluetoothStateActions.start());

  const { type } = BluetoothStateActions.downloadTemperatures();
  const { type: thisActionType } = action;

  if (type === thisActionType) yield call(downloadTemperatures, action);
  else yield call(scanForSensors);

  yield put(BluetoothStateActions.complete());
}

/**
 * Starts a timer counting down until the next passive download.
 */
export function* passiveDownloadingTimer() {
  yield put(PassiveBluetoothActions.startTimer());
  while (true) {
    yield put(PassiveBluetoothActions.decrementTimer());
    yield delay(BLUETOOTH_SERVICE.DEFAULT_TIMER_DELAY);
  }
}

/**
 * When a passive download starts,
 */
export function* startPassiveDownloading() {
  yield put(PassiveBluetoothActions.start());
  while (true) {
    yield put(BluetoothStateActions.downloadTemperatures());
    const timerFork = yield fork(passiveDownloadingTimer);
    yield delay(BLUETOOTH_SERVICE.DEFAULT_PASSIVE_DOWNLOAD_DELAY);
    yield cancel(timerFork);
    yield put(PassiveBluetoothActions.completeTimer());
  }
}

export function* stopPassiveDownloading() {
  yield take(PassiveBluetoothActions.stop);
  yield put(BluetoothStateActions.complete());
  yield put(PassiveBluetoothActions.completeTimer());
  yield put(PassiveBluetoothActions.stopped());
}

/**
 * Watches, forever, passive downloading starting/stopping. Blocks until...
 * a first start action, then sets a race between starting a passive   ...
 * ... sync which never finishes and taking the first stop action,     ...
 * ... which completes instantly.
 */
export function* watchPassiveDownloading() {
  while (true) {
    yield take(PassiveBluetoothActions.start);
    yield race({ start: call(startPassiveDownloading), stop: call(stopPassiveDownloading) });
  }
}

export function* stopScanning() {
  take(BluetoothStateActions.stopScanning);

  const getService = yield getContext('getService');
  const btService = yield call(getService, SERVICES.BLUETOOTH);

  try {
    yield call(btService.stopScan);
    yield put(BluetoothStateActions.stopScanningSucceeded());
    yield put(SensorAction.clearFoundSensors());
  } catch (error) {
    yield put(BluetoothStateActions.stopScanningFailed());
  }
}

export function callback(btService) {
  return eventChannel(emitter => {
    btService.scanForSensors(device => {
      emitter(device);
    });
    return () => {};
  });
}

export function* findSensors() {
  const getService = yield getContext('getService');
  const btService = yield call(getService, SERVICES.BLUETOOTH);

  yield put(BluetoothStateActions.startScanning());

  const channel = yield call(callback, btService);

  try {
    while (true) {
      const device = yield take(channel);
      yield put(SensorAction.foundSensor(device?.id));
    }
  } catch (e) {
    yield put(BluetoothStateActions.startScanningFailed());
  } finally {
    if (yield cancelled()) {
      btService.stopScan();
    }
  }
}

export function* stopOrStart() {
  yield race({ start: call(findSensors), end: take(BluetoothStateActions.stopScanning) });
}

export function* watchScanning() {
  yield fork(stopOrStart);
}

export function* updateSensorLogInterval({ payload: { id, logInterval, macAddress } }) {
  const getService = yield getContext('getService');
  const btService = yield call(getService, SERVICES.BLUETOOTH);

  try {
    yield call(btService.updateLogInterval, macAddress, logInterval);
    yield put(UpdateSensorAction.updateSensorSucceeded());
    yield put(SensorAction.update(id, 'logInterval', logInterval));
  } catch (e) {
    yield put(UpdateSensorAction.updateSensorFailed());
  }
}

export function* connectWithNewSensor({ payload: { macAddress } }) {
  try {
    const getServices = yield getContext('getServices');
    const [btService, settingManager] = yield call(getServices, [
      SERVICES.BLUETOOTH,
      SERVICES.SETTING_MANAGER,
    ]);

    const { value: logInterval } = yield call(
      settingManager.getSetting,
      SETTING.INT.DEFAULT_LOG_INTERVAL
    );
    yield put(BluetoothStateActions.stopScanning());
    yield call(btService.updateLogInterval, macAddress, logInterval);
    yield put(UpdateSensorAction.updateSensorSucceeded());
    yield put(SensorAction.addNewSensor(macAddress, logInterval));
    yield put(BluetoothStateActions.findSensors());
  } catch (e) {
    yield put(UpdateSensorAction.updateSensorFailed());
  }
}

export function* blinkSensor({ payload: { macAddress } }) {
  const getService = yield getContext('getService');
  const btService = yield call(getService, SERVICES.BLUETOOTH);

  try {
    yield put(BluetoothStateActions.stopScanning());
    yield call(btService.blink, macAddress);
    yield put(BluetoothStateActions.blinkSensorSucceeded());
    ToastAndroid.show(t('BLINKED_SENSOR_SUCCESS'), ToastAndroid.SHORT);
  } catch (error) {
    yield put(BluetoothStateActions.blinkSensorFailed(error));
    ToastAndroid.show(t('BLINKED_SENSOR_FAILED'), ToastAndroid.SHORT);
  }
}

/**
 * Root saga for the BluetoothService. Watching for all bluetooth actions.
 * Forks: a watcher for passive downloading start/stopping.
 * Takes: The first downloadTemperatures or scanForSensors action,     ...
 *        ... ignoring any others until it is complete.
 */
export function* BluetoothServiceWatcher() {
  yield fork(watchPassiveDownloading);
  yield takeLeading(BluetoothStateActions.findSensors, watchScanning);
  yield takeLeading(
    [BluetoothStateActions.downloadTemperatures, BluetoothStateActions.scanForSensors],
    startBluetooth
  );
  yield takeEvery(
    BluetoothStateActions.downloadTemperaturesForSensor,
    downloadTemperaturesForSensor
  );
  yield takeEvery(UpdateSensorAction.tryUpdateLogInterval, updateSensorLogInterval);
  yield takeEvery(UpdateSensorAction.tryConnectWithNewSensor, connectWithNewSensor);
  yield takeEvery(BluetoothStateActions.tryBlinkSensor, blinkSensor);
  // yield takeLeading(BluetoothStateActions.findSensors, findSensors);
}
