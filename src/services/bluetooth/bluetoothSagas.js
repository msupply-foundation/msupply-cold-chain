import { delay, takeLeading } from 'redux-saga/effects';
import { BluetoothActions } from './bluetoothSlice';

function* downloadTemperatures() {
  yield delay(10000);
}

export function* BluetoothServiceSaga() {
  yield takeLeading(BluetoothActions.downloadTemperatures, downloadTemperatures);
}
