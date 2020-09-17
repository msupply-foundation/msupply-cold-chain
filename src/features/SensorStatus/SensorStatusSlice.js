import { createSlice } from '@reduxjs/toolkit';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';
import { DEPENDENCY, REDUCER } from '~constants';

import { AcknowledgeBreachAction, ConsecutiveBreachAction } from '../Breach';
import { SensorAction } from '../Entities';

const initialState = {
  fetchingById: {
    // exampleId: false,
  },
  byId: {
    // exampleId: {
    //   macAddress: 'AA',
    //   logInterval: 300,
    //   batteryLevel: 99,
    //   name: 'A',
    //   logDelay: 111,
    //   mostRecentLogTimestamp: 111,
    //   firstTimestamp: 111,
    //   numberOfLogs: 111,
    //   currentTemperature: 111,
    //   minChartTimestamp: 111,
    //   isInHotBreach: false,
    //   isInColdBreach: false,
    //   hasHotBreach: false,
    //   hasColdBreach: false,
    //   isLowBattery: false,
    // },
  },
};

const getById = ({ sensorStatus: { byId } }) => {
  return byId;
};

const getFetchingById = ({ sensorStatus: { fetchingById } }) => {
  return fetchingById;
};

const getStatus = (state, id) => {
  const { [id]: status } = getById(state) ?? {};
  return status ?? {};
};

const hasData = (state, { id }) => {
  const { hasLogs } = getStatus(state, id);
  return !!hasLogs;
};

const lastDownloadTime = (state, { id, formatter }) => {
  const { mostRecentLogTimestamp } = getStatus(state, id);
  return formatter.lastDownloadTime(mostRecentLogTimestamp);
};

const isLoading = (state, { id }) => {
  const { [id]: isFetching } = getFetchingById(state);

  return isFetching;
};

const SensorStatusSelector = {
  getFetchingById,
  hasData,
  lastDownloadTime,
  isLoading,
  byId: ({ sensorStatus }) => {
    return sensorStatus.byId;
  },
  hasHotBreach: ({ sensorStatus }, { id }) => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { hasHotBreach } = status ?? {};

    return hasHotBreach;
  },
  hasColdBreach: ({ sensorStatus }, { id }) => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { hasColdBreach } = status ?? {};

    return hasColdBreach;
  },
  isLowBattery: ({ sensorStatus }, { id }) => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { isLowBattery } = status ?? {};

    return isLowBattery;
  },
  isInDanger: ({ sensorStatus }, { id }) => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { hasColdBreach, hasHotBreach, isLowBattery } = status ?? {};

    return hasColdBreach || hasHotBreach || isLowBattery;
  },
  currentTemperature: ({ sensorStatus }, { id }) => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { currentTemperature } = status ?? {};

    return String(currentTemperature);
  },
};

const reducers = {
  fetch: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: (draftState, { payload: { sensorId } }) => {
      draftState.fetchingById[sensorId] = true;
    },
  },
  fetchSuccess: {
    prepare: (sensorId, status) => ({ payload: { sensorId, status } }),
    reducer: (draftState, { payload: { sensorId, status } }) => {
      draftState.fetchingById[sensorId] = false;
      draftState.byId[sensorId] = status;
    },
  },
  fetchFail: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: (draftState, { payload: { sensorId } }) => {
      draftState.fetchingById[sensorId] = false;
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
  yield takeEvery(AcknowledgeBreachAction.acknowledgeSuccess, refreshSensorStatus);
}

const SensorStatusSaga = { root };

export { SensorStatusAction, SensorStatusReducer, SensorStatusSaga, SensorStatusSelector };
