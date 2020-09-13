import { combineReducers } from '@reduxjs/toolkit';
import { fork } from 'redux-saga/effects';

import { BlinkReducer, BlinkSaga } from './blink';
import { DownloadReducer, DownloadSaga } from './download';
import { ScanReducer, ScanSaga } from './scan';
import { ProgramReducer, ProgramSaga } from './Program';
import { BatteryObserverReducer, BatteryObserverSaga } from './batteryObserver';

import { REDUCER } from '~constants';

export function* root() {
  yield fork(BlinkSaga.root);
  yield fork(DownloadSaga.root);
  yield fork(ScanSaga.root);
  yield fork(BatteryObserverSaga.root);
  yield fork(ProgramSaga.root);
}

export const BluetoothReducer = combineReducers({
  [REDUCER.BLINK]: BlinkReducer,
  [REDUCER.DOWNLOAD]: DownloadReducer,
  [REDUCER.SCAN]: ScanReducer,
  [REDUCER.BATTERY_OBSERVER]: BatteryObserverReducer,
  [REDUCER.PROGRAM]: ProgramReducer,
});

export const BluetoothSaga = { root };
