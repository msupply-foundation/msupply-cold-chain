import { createSlice } from '@reduxjs/toolkit';
import { takeEvery, getContext, call, put } from 'redux-saga/effects';

import { REDUCER, DEPENDENCY } from '~constants';

import { ChartAction } from '../Chart';

const initialState = {
  listCumulative: {},
  detailCumulative: {},
};
const reducers = {
  createBreaches: {
    prepare: sensor => ({ payload: { sensor } }),
    reducer: () => {},
  },
  createBreachesSuccess: {
    prepare: (sensorId, updatedBreaches, updatedLogs) => ({
      payload: { sensorId, updatedBreaches, updatedLogs },
    }),
    reducer: () => {},
  },
  createBreachesFail: {
    prepare: () => {},
    reducer: () => {},
  },
  getListCumulativeForSensor: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: () => {},
  },
  getListCumulativeForSensorSuccessful: {
    prepare: (sensorId, cumulative) => ({ payload: { sensorId, cumulative } }),
    reducer: (draftState, { payload: { sensorId, cumulative } }) => {
      draftState.listCumulative[sensorId] = cumulative;
    },
  },
  getListCumulativeForSensorFailed: () => {},

  getDetailCumulativeForSensor: {
    prepare: (from, to, sensorId) => ({ payload: { sensorId, from, to } }),
    reducer: () => {},
  },
  getDetailCumulativeForSensorSuccessful: {
    prepare: (sensorId, cumulative) => ({ payload: { sensorId, cumulative } }),
    reducer: (draftState, { payload: { sensorId, cumulative } }) => {
      draftState.detailCumulative[sensorId] = cumulative;
    },
  },
  getDetailCumulativeForSensorFailed: () => {},
};

const { actions: BreachAction, reducer: BreachReducer } = createSlice({
  name: REDUCER.BREACH,
  initialState,
  reducers,
});

const BreachSelector = {};

function* getListCumulativeForSensor({ payload: { sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [breachManager, chartManager] = yield call(DependencyLocator.get, [
    DEPENDENCY.BREACH_MANAGER,
    DEPENDENCY.CHART_MANAGER,
  ]);

  try {
    const { minChartTimestamp: from, maxChartTimestamp: to } = yield call(
      chartManager.getChartTimestamps,
      sensorId
    );
    const cumulative = yield call(breachManager.getCumulativeExposure, from, to, sensorId);
    yield put(BreachAction.getListCumulativeForSensorSuccessful(sensorId, cumulative));
  } catch (error) {
    yield put(BreachAction.getListCumulativeForSensorFailed());
  }
}

function* getDetailCumulativeForSensor({ payload: { from, to, sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.BREACH_MANAGER);

  try {
    const cumulative = yield call(breachManager.getCumulativeExposure, from, to, sensorId);
    yield put(BreachAction.getDetailCumulativeForSensorSuccessful(sensorId, cumulative));
  } catch (error) {
    yield put(BreachAction.getDetailCumulativeForSensorFailed());
  }
}

function* createBreaches({ payload: { sensor } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.BREACH_MANAGER);

  const { id } = sensor;

  try {
    const logs = yield call(breachManager.getLogsToCheck, id);
    const configs = yield call(breachManager.getBreachConfigs);
    const mostRecentBreach = yield call(breachManager.getMostRecentBreach, id);

    const [breaches, updatedLogs] = yield call(
      breachManager.createBreaches,
      sensor,
      logs,
      configs,
      mostRecentBreach
    );

    yield call(breachManager.updateBreaches, breaches, updatedLogs);
    yield put(ChartAction.getListChartData(id));
    yield put(BreachAction.createBreachesSuccess(id, breaches, updatedLogs));
    // eslint-disable-next-line no-empty
  } catch (e) {
    yield put(BreachAction.createBreachesFail());
  }
}

function* watchBreachActions() {
  yield takeEvery(BreachAction.getListCumulativeForSensor, getListCumulativeForSensor);
  yield takeEvery(BreachAction.getDetailCumulativeForSensor, getDetailCumulativeForSensor);
  yield takeEvery(BreachAction.createBreaches, createBreaches);
}

const BreachSaga = { watchBreachActions };

export { BreachAction, BreachReducer, BreachSelector, BreachSaga };
