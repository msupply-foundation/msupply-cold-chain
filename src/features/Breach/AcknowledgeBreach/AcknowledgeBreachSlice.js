import { createSlice } from '@reduxjs/toolkit';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';
import { REDUCER, DEPENDENCY } from '~constants';

const initialState = {
  acknowledging: false,
  updating: false,
  fetching: false,
  unacknowledged: [],
};

const reducers = {
  startAcknowledging: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: draftState => {
      draftState.acknowledging = true;
    },
  },
  finishAcknowledging: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: draftState => {
      draftState.acknowledging = false;
    },
  },
  tryAcknowledge: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: draftState => {
      draftState.updating = true;
    },
  },
  acknowledgeSuccess: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: draftState => {
      draftState.updating = false;
      draftState.acknowledging = false;
    },
  },
  acknowledgeFail: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: draftState => {
      draftState.updating = false;
      draftState.acknowledging = false;
    },
  },
  tryFetchUnacknowledged: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: draftState => {
      draftState.fetching = false;
    },
  },
  fetchUnacknowledgedSuccess: {
    prepare: breaches => ({ payload: { breaches } }),
    reducer: (draftState, { payload: { breaches } }) => {
      draftState.fetching = false;
      draftState.unacknowledged = breaches;
    },
  },
  fetchUnacknowledgedFail: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: draftState => {
      draftState.fetching = false;
    },
  },
};

const { actions: AcknowledgeBreachAction, reducer: AcknowledgeBreachReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.ACKNOWLEDGE_BREACH,
});

function* tryFetchUnacknowledged({ payload: { sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.ACKNOWLEDGE_BREACH_MANAGER);

  try {
    const breaches = yield call(breachManager.getUnacknowledged, sensorId);
    yield put(AcknowledgeBreachAction.fetchUnacknowledgedSuccess(breaches));
  } catch (error) {
    yield put(AcknowledgeBreachAction.fetchUnacknowledgedFail());
  }
}

function* tryAcknowledge({ payload: { sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.ACKNOWLEDGE_BREACH_MANAGER);

  try {
    const unacknowledged = yield call(breachManager.getUnacknowledged, sensorId);
    const acknowledged = yield call(breachManager.acknowledge, unacknowledged);
    yield put(AcknowledgeBreachAction.acknowledgeSuccess(sensorId, acknowledged));
  } catch (error) {
    yield put(AcknowledgeBreachAction.acknowledgeFail());
  }
}

function* startAcknowledging({ payload: { sensorId } }) {
  yield put(AcknowledgeBreachAction.tryFetchUnacknowledged(sensorId));
}

function* root() {
  yield takeEvery(AcknowledgeBreachAction.startAcknowledging, startAcknowledging);
  yield takeEvery(AcknowledgeBreachAction.tryAcknowledge, tryAcknowledge);
  yield takeEvery(AcknowledgeBreachAction.tryFetchUnacknowledged, tryFetchUnacknowledged);
}

const AcknowledgeBreachSaga = { root, tryAcknowledge, startAcknowledging };

const AcknowledgeBreachSelector = {};

export {
  AcknowledgeBreachAction,
  AcknowledgeBreachReducer,
  AcknowledgeBreachSaga,
  AcknowledgeBreachSelector,
};
