import { all, takeEvery, getContext, call, put } from 'redux-saga/effects';
import moment from 'moment';
import { createSlice } from '@reduxjs/toolkit';
import { SERVICES, REDUCER_SHAPE } from '~constants';

import { HydrateAction } from '../hydrate/hydrateSlice';

const initialState = {
  listLoading: {},
  listDataPoints: {},
  detailDataPoints: [],
};

const reducers = {
  hydrate: () => {},
  hydrateSuccessful: () => {},
  hydrateFailed: () => {},

  getListChartData: {
    prepare: (sensorId, dataPoints = 30) => ({
      payload: {
        from: moment().subtract(3, 'days').unix(),
        to: moment().unix(),
        sensorId,
        dataPoints,
      },
    }),
    reducer: (draftState, { payload: { sensorId } }) => {
      draftState.listLoading[sensorId] = true;
    },
  },
  getListChartDataSuccessful: {
    prepare: (data, sensorId) => ({ payload: { data, sensorId } }),
    reducer: (draftState, { payload: { data, sensorId } }) => {
      draftState.listDataPoints[sensorId] = data;
      draftState.listLoading[sensorId] = false;
    },
  },
  getListChartDataFailed: (draftState, { payload: { sensorId } }) => {
    draftState.listLoading[sensorId] = false;
  },

  getDetailChartData: {
    prepare: (from, to, sensorId, dataPoints = 30) => ({
      payload: { from, to, sensorId, dataPoints },
    }),
    reducer: draftState => {
      draftState.detailDataPoints = [];
    },
  },
  getDetailChartDataSuccessful: {
    prepare: data => ({ payload: { data } }),
    reducer: (draftState, { payload: { data } }) => {
      draftState.detailDataPoints = data;
    },
  },
  getDetailChartDataFailed: () => {},

  addChartData: {
    prepare: (sensorId, logs) => ({ payload: { sensorId, logs } }),
    reducer: (draftState, { payload: { sensorId, logs } }) => {
      draftState.listDataPoints[sensorId] = logs;
    },
  },
};

const ChartSelector = {
  getLogs({ chart: { listDataPoints } }) {
    return listDataPoints;
  },
  detailDataPoints: ({ chart: { detailDataPoints } }) => {
    return detailDataPoints;
  },
};

const { actions: ChartAction, reducer: ChartReducer } = createSlice({
  name: REDUCER_SHAPE.CHART,
  reducers,
  initialState,
});

function* getListChartData({ payload: { sensorId, dataPoints } }) {
  const getService = yield getContext('getService');
  const chartManager = yield call(getService, SERVICES.CHART_MANAGER);

  try {
    const { minChartTimestamp, maxChartTimestamp } = yield call(
      chartManager.getChartTimestamps,
      sensorId
    );

    const result = yield call(
      chartManager.getLogs,
      minChartTimestamp,
      maxChartTimestamp,
      sensorId,
      dataPoints
    );

    yield put(ChartAction.getListChartDataSuccessful(result, sensorId));
  } catch (error) {
    yield put(ChartAction.getListChartDataFailed());
  }
}

function* getDetailChartData({ payload: { from, to, sensorId, dataPoints } }) {
  const getService = yield getContext('getService');
  const chartManager = yield call(getService, SERVICES.CHART_MANAGER);

  try {
    const result = yield call(chartManager.getLogs, from, to, sensorId, dataPoints);
    yield put(ChartAction.getDetailChartDataSuccessful(result));
  } catch (error) {
    yield put(ChartAction.getDetailChartDataFailed());
  }
}

function* hydrate() {
  const getService = yield getContext('getService');
  const sensorManager = yield call(getService, SERVICES.SENSOR_MANAGER);

  try {
    const sensors = yield call(sensorManager.getAll);
    yield all(sensors.map(({ id }) => put(ChartAction.getListChartData(id))));
    yield put(HydrateAction.chart());
  } catch (error) {
    yield put(ChartAction.hydrateFailed());
  }
}

function* watchChartActions() {
  yield takeEvery(ChartAction.hydrate, hydrate);
  yield takeEvery(ChartAction.getListChartData, getListChartData);
  yield takeEvery(ChartAction.getDetailChartData, getDetailChartData);
}

const ChartSaga = { watchChartActions };

export { ChartSaga, ChartAction, ChartReducer, ChartSelector };
