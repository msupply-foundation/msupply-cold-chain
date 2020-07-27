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
} from 'redux-saga/effects';
import { PassiveBluetoothActions, BluetoothStateActions } from './bluetoothSlice';
import { SERVICES } from '../../shared/constants';

function* downloadTemperatures() {
  const getService = yield getContext('getService');
  const btService = getService(SERVICES.BLUETOOTH);

  yield call(btService.scanForDevices);
  yield delay(10000);
}

function* scanForSensors() {
  yield delay(10000);
}

/**
 * Starts some bluetooth action - download temperatures or scanning   ...
 * ... for sensors. Blocks during one of these process'
 */
function* startBluetooth(action) {
  yield put(BluetoothStateActions.start());

  const { type } = BluetoothStateActions.downloadTemperatures();
  const { type: thisActionType } = action;

  if (type === thisActionType) yield call(downloadTemperatures);
  else yield call(scanForSensors);

  yield put(BluetoothStateActions.complete());
}

function* passiveDownloadingTimer() {
  yield put(PassiveBluetoothActions.startTimer());
  while (true) {
    yield put(PassiveBluetoothActions.decrementTimer());
    yield put(BluetoothStateActions.downloadTemperatures());
    yield delay(5000);
  }
}

/**
 * When a passive download starts,
 */
function* passiveDownloading() {
  while (true) {
    yield put(BluetoothStateActions.downloadTemperatures());
    const timerFork = yield fork(passiveDownloadingTimer);
    yield delay(10000);
    yield cancel(timerFork);
    yield put(PassiveBluetoothActions.completeTimer());
  }
}

/**
 * Watches, forever passive downloading starting/stopping. Blocks until...
 * a first start action, then sets a race between starting a passive   ...
 * ... sync which never finishes and taking the first stop action,     ...
 * ... which completes instantly.
 */
function* watchPassiveDownloading() {
  while (true) {
    yield take(PassiveBluetoothActions.start);
    yield race([call(passiveDownloading), take(PassiveBluetoothActions.stop)]);
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
}
