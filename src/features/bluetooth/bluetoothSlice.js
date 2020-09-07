import { combineReducers } from '@reduxjs/toolkit';
import { fork } from 'redux-saga/effects';

import { BlinkReducer, BlinkSaga } from './blink';
import { DownloadReducer, DownloadSaga } from './download';
import { ScanReducer, ScanSaga } from './scan';
import { UpdateReducer, UpdateSaga } from './update';
import { BatteryObserverReducer, BatteryObserverSaga } from './batteryObserver';
import { NewSensorReducer, NewSensorSaga } from './newSensor';

export function* root() {
  yield fork(BlinkSaga.root);
  yield fork(DownloadSaga.root);
  yield fork(ScanSaga.root);
  yield fork(UpdateSaga.root);
  yield fork(BatteryObserverSaga.root);
  yield fork(NewSensorSaga.root);
}

export const BluetoothReducer2 = combineReducers({
  blink: BlinkReducer,
  download: DownloadReducer,
  scan: ScanReducer,
  update: UpdateReducer,
  battery: BatteryObserverReducer,
  newSensor: NewSensorReducer,
});

export const BluetoothSaga = { root };
