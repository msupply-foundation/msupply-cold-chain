import moment from 'moment';
import { createSlice } from '@reduxjs/toolkit';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '~constants';

const initialState = {
  listLoadingById: {},
  listDataById: {},
  detailDataPoints: [],
};

const reducers = {
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
      draftState.listLoadingById[sensorId] = true;
    },
  },
  getListChartDataSuccessful: {
    prepare: (data, sensorId) => ({ payload: { data, sensorId } }),
    reducer: (draftState, { payload: { data, sensorId } }) => {
      draftState.listDataById[sensorId] = data;
      draftState.listLoadingById[sensorId] = false;
    },
  },
  getListChartDataFailed: (draftState, { payload: { sensorId } }) => {
    draftState.listLoadingById[sensorId] = false;
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
      draftState.listDataById[sensorId] = logs;
    },
  },
};

const listData = ({ chart: { listDataById } }, { id }) => {
  return listDataById[id];
};

const detailData = ({ chart: { detailDataPoints } }) => {
  return detailDataPoints;
};

const isLoading = ({ chart: { listLoadingById } }, { id }) => {
  return listLoadingById[id] ?? true;
};

const ChartSelector = {
  listData,
  detailData,
  isLoading,
};

const { actions: ChartAction, reducer: ChartReducer } = createSlice({
  name: REDUCER.CHART,
  reducers,
  initialState,
});

function* getListChartData({ payload: { sensorId, dataPoints } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const chartManager = yield call(DependencyLocator.get, DEPENDENCY.CHART_MANAGER);

  try {
    const { from, to } = yield call(chartManager.getChartTimestamps, sensorId);
    const result = yield call(chartManager.getLogs, from, to, sensorId, dataPoints);
    yield put(ChartAction.getListChartDataSuccessful(result, sensorId));
  } catch (error) {
    yield put(ChartAction.getListChartDataFailed());
  }
}

function* getDetailChartData({ payload: { from, to, sensorId, dataPoints } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const chartManager = yield call(DependencyLocator.get, DEPENDENCY.CHART_MANAGER);

  try {
    const result = yield call(chartManager.getLogs, from, to, sensorId, dataPoints);
    yield put(ChartAction.getDetailChartDataSuccessful(result));
  } catch (error) {
    yield put(ChartAction.getDetailChartDataFailed());
  }
}

function* watchChartActions() {
  yield takeEvery(ChartAction.getListChartData, getListChartData);
  yield takeEvery(ChartAction.getDetailChartData, getDetailChartData);
}

const ChartSaga = { watchChartActions };

export { ChartSaga, ChartAction, ChartReducer, ChartSelector };
