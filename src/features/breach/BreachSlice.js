import { createSlice } from '@reduxjs/toolkit';
import { takeEvery, getContext, call, put, all } from 'redux-saga/effects';

import { REDUCER_SHAPE , SERVICES } from '~constants';

import { SensorAction } from '../sensor';
import { ChartAction } from '../chart';

const initialState = {
  ids: [],
  byId: [],
  breaches: [],
  chartLogs: [],
  sensorId: '',
  breachId: '',
  listCumulative: {},
  detailCumulative: {},
};
const reducers = {
  createBreaches: {
    prepare: sensor => ({ payload: { sensor } }),
    reducer: () => {},
  },

  getAllCumulativeExposures: () => {},
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

  getBreachesForSensor: {
    reducer: (draftState, { payload: { sensorId } }) => {
      draftState.sensorId = sensorId;
    },
    prepare: sensorId => ({ payload: { sensorId } }),
  },
  getBreachesForSensorSuccessful: {
    prepare: breaches => ({ payload: { breaches } }),
    reducer: (draftState, { payload: { breaches } }) => {
      const ids = breaches.map(({ id }) => id);
      const byId = breaches.reduce((acc, breach) => {
        return { ...acc, [breach.id]: breach };
      }, {});

      draftState.ids = ids;
      draftState.byId = byId;
      draftState.breaches = breaches;
    },
  },
  getBreachesForSensorFailed: () => {},

  getLogsForBreach: {
    prepare: breachId => ({ payload: { breachId } }),
    reducer: draftState => {
      draftState.chartLogs = [];
    },
  },
  getLogsForBreachSuccessful: {
    prepare: logs => ({ payload: { logs } }),
    reducer: (draftState, { payload: { logs } }) => {
      draftState.chartLogs = logs;
    },
  },
  getLogsForBreachFailed: () => {},
  reset: draftState => {
    draftState.ids = [];
    draftState.byId = [];
    draftState.breaches = [];
    draftState.chartLogs = [];
    draftState.sensorId = '';
    draftState.breachId = '';
  },
  sort: {
    prepare: (key, isAsc) => ({ payload: { key, isAsc } }),
    reducer: (draftState, { payload: { key, isAsc } }) => {
      draftState.breaches = draftState.breaches.sort(({ [key]: keyA }, { [key]: keyB }) => {
        if (isAsc) return keyA - keyB;
        return keyB - keyA;
      });
      draftState.ids = draftState.breaches.map(({ id }) => id);
    },
  },
};

const { actions: BreachAction, reducer: BreachReducer } = createSlice({
  name: REDUCER_SHAPE.BREACH,
  initialState,
  reducers,
});

const BreachSelector = {
  getLogsForBreach({ breach }) {
    return breach.chartLogs;
  },
  getBreachesForSensor({ breach }) {
    return breach.breaches;
  },
};

function* getLogsForBreach({ payload: { breachId } }) {
  const getService = yield getContext('getService');
  const manager = yield call(getService, SERVICES.BREACH_MANAGER);

  try {
    const result = yield call(manager.getLogsForBreach, breachId);

    yield put(BreachAction.getLogsForBreachSuccessful(result));
  } catch (error) {
    yield put(BreachAction.getLogsForBreachFailed());
  }
}

function* getBreachesForSensor({ payload: { sensorId } }) {
  const getService = yield getContext('getService');
  const manager = yield call(getService, SERVICES.BREACH_MANAGER);

  try {
    const result = yield call(manager.getTableData, sensorId);
    yield put(BreachAction.getBreachesForSensorSuccessful(result));

    if (result.length) {
      yield put(BreachAction.getLogsForBreach(result[0]?.id));
    }
  } catch (error) {
    yield put(BreachAction.getBreachesForSensorFailed());
  }
}

function* getListCumulativeForSensor({ payload: { sensorId } }) {
  const getServices = yield getContext('getServices');
  const [breachManager, chartManager] = yield call(getServices, [
    SERVICES.BREACH_MANAGER,
    SERVICES.CHART_MANAGER,
  ]);

  try {
    const { minChartTimestamp: from, maxChartTimestamp: to } = yield call(
      chartManager.getChartTimestamps,
      sensorId
    );

    const cumulative = yield call(breachManager.getCumulativeExposure, from, to, sensorId);
    yield put(BreachAction.getListCumulativeForSensorSuccessful(sensorId, cumulative));
  } catch (error) {
    console.log('-------------------------------------------');
    console.log('error', error);
    console.log('-------------------------------------------');
    yield put(BreachAction.getListCumulativeForSensorFailed());
  }
}

function* getDetailCumulativeForSensor({ payload: { from, to, sensorId } }) {
  const getService = yield getContext('getService');
  const breachManager = yield call(getService, SERVICES.BREACH_MANAGER);

  try {
    const cumulative = yield call(breachManager.getCumulativeExposure, from, to, sensorId);
    yield put(BreachAction.getDetailCumulativeForSensorSuccessful(sensorId, cumulative));
  } catch (error) {
    console.log('-------------------------------------------');
    console.log('error', error);
    console.log('-------------------------------------------');
    yield put(BreachAction.getDetailCumulativeForSensorFailed());
  }
}

function* getAllCumulativeExposures() {
  const getService = yield getContext('getService');
  const sensorManager = yield call(getService, SERVICES.SENSOR_MANAGER);

  try {
    const sensors = yield call(sensorManager.getAll);
    yield all(sensors.map(({ id }) => put(BreachAction.getListCumulativeForSensor(id))));
  } catch (error) {
    console.log('-------------------------------------------');
    console.log('error', error);
    console.log('-------------------------------------------');
  }
}

function* createBreaches({ payload: { sensor } }) {
  const getService = yield getContext('getService');
  const breachManager = yield call(getService, SERVICES.BREACH_MANAGER);

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
    yield put(SensorAction.getSensorState(id));
  } catch (e) {
    console.log('-------------------------------------------');
    console.log('e', e.message);
    console.log('-------------------------------------------');
  }
}

function* watchBreachActions() {
  yield takeEvery(BreachAction.getBreachesForSensor, getBreachesForSensor);
  yield takeEvery(BreachAction.getLogsForBreach, getLogsForBreach);
  yield takeEvery(BreachAction.getListCumulativeForSensor, getListCumulativeForSensor);
  yield takeEvery(BreachAction.getDetailCumulativeForSensor, getDetailCumulativeForSensor);
  yield takeEvery(BreachAction.getAllCumulativeExposures, getAllCumulativeExposures);
  yield takeEvery(BreachAction.createBreaches, createBreaches);
}

const BreachSaga = { watchBreachActions };

export { BreachAction, BreachReducer, BreachSelector, BreachSaga };
