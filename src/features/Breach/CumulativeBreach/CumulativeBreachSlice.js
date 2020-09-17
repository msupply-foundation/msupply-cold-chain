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

const detailColdCumulative = ({ breach: { cumulative } }) => {
  const { detail } = cumulative;
  const { coldCumulative } = detail;

  return coldCumulative;
};

const detailHotCumulative = ({ breach: { cumulative } }) => {
  const { detail } = cumulative;
  const { hotCumulative } = detail;

  return hotCumulative;
};

const listColdCumulative = ({ breach: { cumulative } }, { id, formatter }) => {
  const { listById } = cumulative;
  const { [id]: listCumulative } = listById;
  const { coldCumulative } = listCumulative ?? {};

  return coldCumulative ? formatter.listCumulativeBreach(coldCumulative) : '';
};

const listHotCumulative = ({ breach: { cumulative } }, { id, formatter }) => {
  const { listById } = cumulative;
  const { [id]: listCumulative } = listById;
  const { hotCumulative } = listCumulative ?? {};

  return hotCumulative ? formatter.listCumulativeBreach(hotCumulative) : '';
};

const CumulativeBreachSelector = {
  detailColdCumulative,
  detailHotCumulative,
  listColdCumulative,
  listHotCumulative,
};

function* fetchListForSensor({ payload: { sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [breachManager, chartManager] = yield call(DependencyLocator.get, [
    DEPENDENCY.CUMULATIVE_BREACH_MANAGER,
    DEPENDENCY.CHART_MANAGER,
  ]);

  try {
    const { from, to } = yield call(chartManager.getChartTimestamps, sensorId);
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
