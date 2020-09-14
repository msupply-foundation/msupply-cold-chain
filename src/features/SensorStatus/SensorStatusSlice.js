import { createSlice } from '@reduxjs/toolkit';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';
import { DEPENDENCY, REDUCER } from '~constants';

import { ConsecutiveBreachAction } from '../Breach';
import { SensorAction } from '../Entities';

const initialState = {
  fetchingStatusById: { exampleId: false },
  byId: {
    exampleId: {
      macAddress: 'AA',
      logInterval: 300,
      batteryLevel: 99,
      name: 'A',
      logDelay: 111,
      mostRecentLogTimestamp: 111,
      firstTimestamp: 111,
      numberOfLogs: 111,
      currentTemperature: 111,
      minChartTimestamp: 111,
      isInHotBreach: false,
      isInColdBreach: false,
    },
  },
};

const SensorStatusSelector = {
  byId: ({ sensorStatus }) => {
    return sensorStatus.byId;
  },
};

const reducers = {
  fetch: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: (draftState, { payload: { sensorId } }) => {
      draftState.fetchingStatusById[sensorId] = true;
    },
  },
  fetchSuccess: {
    prepare: (sensorId, status) => ({ payload: { sensorId, status } }),
    reducer: (draftState, { payload: { sensorId, status } }) => {
      draftState.fetchingStatusById[sensorId] = false;
      draftState.byId[sensorId] = status;
    },
  },
  fetchFail: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: (draftState, { payload: { sensorId } }) => {
      draftState.fetchingStatusById[sensorId] = false;
    },
  },
  updateBatteryLevel: {
    prepare: (sensorId, batteryLevel) => ({ payload: { sensorId, batteryLevel } }),
    reducer: (draftState, { payload: { sensorId, batteryLevel } }) => {
      draftState.batteryLevelById[sensorId] = batteryLevel;
    },
  },
};

const { actions: SensorStatusAction, reducer: SensorStatusReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.SENSOR_STATUS,
});

function* getSensorStatus({ payload: { sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorStatusManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_STATUS_MANAGER);
  try {
    const state = yield call(sensorStatusManager.getSensorStatus, sensorId);
    yield put(SensorStatusAction.fetchSuccess(sensorId, state));
  } catch (error) {
    yield put(SensorStatusAction.fetchFail(sensorId));
  }
}

function* refreshSensorStatus({ payload: { sensorId } }) {
  yield put(SensorStatusAction.fetch(sensorId));
}

function* root() {
  yield takeEvery(SensorStatusAction.fetch, getSensorStatus);
  yield takeEvery(ConsecutiveBreachAction.createSuccess, refreshSensorStatus);
  yield takeEvery(SensorAction.update, refreshSensorStatus);
  yield takeEvery(SensorAction.createSuccess, refreshSensorStatus);
}

const SensorStatusSaga = { root };

export { SensorStatusAction, SensorStatusReducer, SensorStatusSaga, SensorStatusSelector };
