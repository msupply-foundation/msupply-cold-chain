import { createSlice } from '@reduxjs/toolkit';
import { call, getContext, put, select, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '~constants';
import { DetailAction, DetailSelector } from '../Detail/DetailSlice';

const initialState = {
  data: [],
  numberOfDataPoints: 30,
  isLoading: false,
};

const reducers = {
  fetch: {
    prepare: (sensorId, from, to, dataPoints = 30) => ({
      payload: { from, to, sensorId, dataPoints },
    }),
    reducer: draftState => {
      draftState.data = [];
      draftState.isLoading = true;
    },
  },
  fetchSuccess: {
    prepare: data => ({ payload: { data } }),
    reducer: (draftState, { payload: { data } }) => {
      draftState.data = data;
      draftState.isLoading = false;
    },
  },
  fetchFail: () => {},
};

const extraReducers = {
  // eslint-disable-next-line no-unused-vars
  [DetailAction.flush]: draftState => {
    // eslint-disable-next-line no-param-reassign
    draftState = initialState;
  },
};

const { actions: DetailChartAction, reducer: DetailChartReducer } = createSlice({
  initialState,
  reducers,
  extraReducers,
  name: REDUCER.DETAIL_CHART,
});

const DetailChartSelector = {
  numberOfDataPoints: ({ sensorDetail: { detailChart } }) => {
    const { numberOfDataPoints } = detailChart;
    return numberOfDataPoints;
  },
  data: ({ sensorDetail: { detailChart } }) => {
    const { data } = detailChart;
    return data;
  },
  isLoading: ({ sensorDetail: { detailChart } }) => {
    const { isLoading } = detailChart;
    return isLoading;
  },
};

function* fetch({ payload: { from, to, sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const chartManager = yield call(DependencyLocator.get, DEPENDENCY.CHART_MANAGER);

  const dataPoints = yield select(DetailChartSelector.numberOfDataPoints);

  try {
    const result = yield call(chartManager.getLogs, from, to, sensorId, dataPoints);
    yield put(DetailChartAction.fetchSuccess(result));
  } catch (error) {
    yield put(DetailChartAction.fetchFail());
  }
}

function* triggerFetch({ payload: { sensorId, from, to } }) {
  const id = yield select(DetailSelector.sensorId);
  yield put(DetailChartAction.fetch(sensorId ?? id, from, to));
}

function* root() {
  yield takeEvery(DetailChartAction.fetch, fetch);
  yield takeEvery(DetailAction.fetchSuccess, triggerFetch);
  yield takeEvery(DetailAction.updateDateRange, triggerFetch);
}

const DetailChartSaga = { root };

export { DetailChartAction, DetailChartReducer, DetailChartSaga, DetailChartSelector };
