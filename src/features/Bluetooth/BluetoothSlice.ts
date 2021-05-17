import { SagaIterator } from '@redux-saga/types';
import { combineReducers } from '@reduxjs/toolkit';
import { fork } from 'redux-saga/effects';
import { REDUCER } from '../../common/constants';
import { BlinkReducer, BlinkSaga } from './Blink';
import { DownloadReducer, DownloadSaga } from './Download';
import { ScanReducer, ScanSaga } from './Scan';
import { ProgramReducer, ProgramSaga } from './Program';
import { BatteryObserverReducer, BatteryObserverSaga } from './BatteryObserver';

export function* root(): SagaIterator {
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
