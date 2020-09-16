import { createSlice } from '@reduxjs/toolkit';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '~constants';

const initialState = {
  listById: {},
  detail: null,
};

const reducers = {
  fetchListForSensor: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: () => {},
  },
  fetchListForSensorSuccess: {
    prepare: (sensorId, cumulative) => ({ payload: { sensorId, cumulative } }),
    reducer: (draftState, { payload: { sensorId, cumulative } }) => {
      draftState.listById[sensorId] = cumulative;
    },
  },
  fetchListForSensorFail: () => {},

  fetchDetailForSensor: {
    prepare: (from, to, sensorId) => ({ payload: { sensorId, from, to } }),
    reducer: draftState => {
      draftState.detail = null;
    },
  },
  fetchDetailForSensorSuccess: {
    prepare: (sensorId, cumulative) => ({ payload: { sensorId, cumulative } }),
    reducer: (draftState, { payload: { cumulative } }) => {
      draftState.detail = cumulative;
    },
  },
  fetchDetailForSensorFail: () => {},
};

const { actions: CumulativeBreachAction, reducer: CumulativeBreachReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.CUMULATIVE_BREACH,
});

const CumulativeBreachSelector = {
  detailColdCumulative: ({ breach: { cumulativeBreach } }) => {
    const { detail } = cumulativeBreach;
    const { coldCumulative } = detail;

    return coldCumulative;
  },
  detailHotCumulative: ({ breach: { cumulativeBreach } }) => {
    const { detail } = cumulativeBreach;
    const { hotCumulative } = detail;

    return hotCumulative;
  },
  listColdCumulative: ({ breach: { cumulativeBreach } }, { id, formatter }) => {
    const { listById } = cumulativeBreach;
    const { [id]: listCumulative } = listById;
    const { coldCumulative } = listCumulative;

    return coldCumulative ? formatter.listCumulativeBreach(coldCumulative) : '';
  },
  listHotCumulative: ({ breach: { cumulativeBreach } }, { id, formatter }) => {
    const { listById } = cumulativeBreach;
    const { [id]: listCumulative } = listById;
    const { hotCumulative } = listCumulative;

    return hotCumulative ? formatter.listCumulativeBreach(hotCumulative) : '';
  },
};

function* fetchListForSensor({ payload: { sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [breachManager, chartManager] = yield call(DependencyLocator.get, [
    DEPENDENCY.CUMULATIVE_BREACH_MANAGER,
    DEPENDENCY.CHART_MANAGER,
  ]);

  try {
    const { minChartTimestamp: from, maxChartTimestamp: to } = yield call(
      chartManager.getChartTimestamps,
      sensorId
    );
    const cumulative = yield call(breachManager.getCumulativeExposure, from, to, sensorId);
    yield put(CumulativeBreachAction.fetchListForSensorSuccess(sensorId, cumulative));
  } catch (error) {
    yield put(CumulativeBreachAction.fetchListForSensorFail());
  }
}

function* fetchDetailForSensor({ payload: { from, to, sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.CUMULATIVE_BREACH_MANAGER);

  try {
    const cumulative = yield call(breachManager.getCumulativeExposure, from, to, sensorId);
    yield put(CumulativeBreachAction.fetchDetailForSensorSuccess(sensorId, cumulative));
  } catch (error) {
    yield put(CumulativeBreachAction.fetchDetailForSensorFail());
  }
}

function* root() {
  yield takeEvery(CumulativeBreachAction.fetchListForSensor, fetchListForSensor);
  yield takeEvery(CumulativeBreachAction.fetchDetailForSensor, fetchDetailForSensor);
}

const CumulativeBreachSaga = { root, fetchDetailForSensor, fetchListForSensor };

export {
  CumulativeBreachAction,
  CumulativeBreachReducer,
  CumulativeBreachSaga,
  CumulativeBreachSelector,
};
