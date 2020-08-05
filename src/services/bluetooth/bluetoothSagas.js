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
} from 'redux-saga/effects';
import { PassiveBluetoothActions, BluetoothStateActions } from './bluetoothSlice';
import { SERVICES, BLUETOOTH_SERVICE } from '~constants';
import { TemperatureLogActions, SensorsActions } from '~database/DatabaseSlice';

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

  yield put(SensorsActions.saveSensors(result));
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

/**
 * Root saga for the BluetoothService. Watching for all bluetooth actions.
 * Forks: a watcher for passive downloading start/stopping.
 * Takes: The first downloadTemperatures or scanForSensors action,     ...
 *        ... ignoring any others until it is complete.
 */
export function* BluetoothServiceWatcher() {
  yield fork(watchPassiveDownloading);
  yield takeLeading(
    [BluetoothStateActions.downloadTemperatures, BluetoothStateActions.scanForSensors],
    startBluetooth
  );
  yield takeEvery(
    BluetoothStateActions.downloadTemperaturesForSensor,
    downloadTemperaturesForSensor
  );
}
