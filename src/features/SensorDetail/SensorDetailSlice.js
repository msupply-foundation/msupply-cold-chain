import { combineReducers } from '@reduxjs/toolkit';
import { fork } from 'redux-saga/effects';

import { REDUCER } from '~constants';

import { DetailReducer, DetailSaga } from './Detail';
import { LogTableReducer, LogTableSaga } from './LogTable';
import { DetailCumulativeReducer, DetailCumulativeSaga } from './DetailCumulativeBreach';
import { DetailChartReducer, DetailChartSaga } from './DetailChart';

export function* root() {
  yield fork(LogTableSaga.root);
  yield fork(DetailSaga.root);
  yield fork(DetailCumulativeSaga.root);
  yield fork(DetailChartSaga.root);
}

export const SensorDetailReducer = combineReducers({
  [REDUCER.LOG_TABLE]: LogTableReducer,
  [REDUCER.DETAIL]: DetailReducer,
  [REDUCER.DETAIL_CUMULATIVE_BREACH]: DetailCumulativeReducer,
  [REDUCER.DETAIL_CHART]: DetailChartReducer,
});

export const SensorDetailSaga = { root };
