import { takeEvery, getContext, call, put } from 'redux-saga/effects';

import { createSlice } from '@reduxjs/toolkit';
import { REDUCER_SHAPE, SERVICES } from '~constants';

const initialState = { byId: [], ids: [] };
const reducers = {
  init: () => {},
  initSucceeded: {
    reducer: (draftState, { payload: { configs } }) => {
      draftState.byId = configs.reduce((acc, value) => {
        return { ...acc, [value.id]: value };
      }, {});
      draftState.ids = configs.map(({ id }) => id);
    },
    prepare: configs => ({ payload: { configs } }),
  },
  // Should probably like, stop people from using the app if this fails
  // as the db is probs like, corrupted or something :shrug
  initFailed: () => {},
  update: {
    reducer: () => {},
    prepare: (id, key, value) => ({ payload: { id, key, value } }),
  },
  updateSuccessful: {
    reducer: (draftState, { payload: { id, key, value } }) => {
      draftState.byId[id] = { ...draftState.byId[id], [key]: value };
    },
    prepare: (id, key, value) => ({ payload: { id, key, value } }),
  },
  updateFailed: () => {},
};

const { actions: BreachConfigurationAction, reducer: BreachConfigurationReducer } = createSlice({
  name: REDUCER_SHAPE.BREACH_CONFIGURATION,
  initialState,
  reducers,
});

const BreachConfigurationSelector = {};

function* updatedBreachConfiguration({ payload: { id, key, value } }) {
  const getService = yield getContext('getService');
  const breachConfigurationManager = yield call(getService, SERVICES.BREACH_CONFIGURATION_MANAGER);

  try {
    yield call(breachConfigurationManager.updateField, id, key, value);
    yield put(BreachConfigurationAction.updateSuccessful(id, key, value));
  } catch (error) {
    yield put(BreachConfigurationAction.updateFailed(error));
  }
}

function* initSaga() {
  const getService = yield getContext('getService');
  const breachConfigurationManager = yield call(getService, SERVICES.BREACH_CONFIGURATION_MANAGER);

  try {
    const result = yield call(breachConfigurationManager.init);
    yield put(BreachConfigurationAction.initSucceeded(result));
  } catch (error) {
    yield put(BreachConfigurationAction.initFailed());
  }
}

function* watchBreachConfigurationActions() {
  yield takeEvery(BreachConfigurationAction.init, initSaga);
  yield takeEvery(BreachConfigurationAction.update, updatedBreachConfiguration);
}

const BreachConfigurationSaga = {
  watchBreachConfigurationActions,
  initSaga,
  updatedBreachConfiguration,
};

export {
  BreachConfigurationReducer,
  BreachConfigurationAction,
  BreachConfigurationSaga,
  BreachConfigurationSelector,
};