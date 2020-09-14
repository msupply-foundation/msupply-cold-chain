import { createSlice } from '@reduxjs/toolkit';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '~constants';
import { ChartAction } from '../../Chart';

const initialState = {};

const reducers = {
  create: {
    prepare: sensor => ({ payload: { sensor } }),
    reducer: (draftState, { payload: { sensor } }) => {
      const { id } = sensor;
      draftState.creatingById[id] = true;
    },
  },
  createSuccess: {
    prepare: (sensorId, updatedBreaches, updatedLogs) => ({
      payload: { sensorId, updatedBreaches, updatedLogs },
    }),
    reducer: (draftState, { payload: { sensor } }) => {
      const { id } = sensor;
      draftState.creatingById[id] = true;
    },
  },
  createFail: (draftState, { payload: { sensor } }) => {
    const { id } = sensor;
    draftState.creatingById[id] = true;
  },
};

const { actions: ConsecutiveBreachAction, reducer: ConsecutiveBreachReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.CONSECUTIVE_BREACH,
});

function* create({ payload: { sensor } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.CONSECUTIVE_BREACH_MANAGER);

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
    yield put(ConsecutiveBreachAction.createSuccess(id, breaches, updatedLogs));
  } catch (e) {
    yield put(ConsecutiveBreachAction.createFail());
  }
}

function* root() {
  yield takeEvery(ConsecutiveBreachAction.create, create);
}

const ConsecutiveBreachSaga = { root };

const ConsecutiveBreachSelector = {};

export {
  ConsecutiveBreachAction,
  ConsecutiveBreachReducer,
  ConsecutiveBreachSaga,
  ConsecutiveBreachSelector,
};
