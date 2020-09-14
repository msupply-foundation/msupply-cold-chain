import { createSlice } from '@reduxjs/toolkit';
import { takeEvery, getContext, call, put } from 'redux-saga/effects';

import { REDUCER, DEPENDENCY } from '~constants';

const initialState = { byId: [], ids: [] };
const reducers = {
  hydrate: () => {},
  hydrateSucceeded: {
    reducer: (draftState, { payload: { configs } }) => {
      draftState.byId = configs.reduce((acc, value) => {
        return { ...acc, [value.id]: value };
      }, {});
      draftState.ids = configs.map(({ id }) => id);
    },
    prepare: configs => ({ payload: { configs } }),
  },
  hydrateFailed: () => {},
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
  name: REDUCER.BREACH_CONFIGURATION,
  initialState,
  reducers,
});

const BreachConfigurationSelector = {
  hotBreachConfig: ({ entities: { breachConfiguration } }) => {
    return breachConfiguration.byId.HOT_BREACH;
  },
  coldBreachConfig: ({ entities: { breachConfiguration } }) => {
    return breachConfiguration.byId.COLD_BREACH;
  },
  hotCumulativeConfig: ({ entities: { breachConfiguration } }) => {
    return breachConfiguration.byId.HOT_CUMULATIVE;
  },
  coldCumulativeConfig: ({ entities: { breachConfiguration } }) => {
    return breachConfiguration.byId.COLD_CUMULATIVE;
  },
};

function* updatedBreachConfiguration({ payload: { id, key, value } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachConfigurationManager = yield call(
    DependencyLocator.get,
    DEPENDENCY.BREACH_CONFIGURATION_MANAGER
  );

  try {
    yield call(breachConfigurationManager.updateField, id, key, value);
    yield put(BreachConfigurationAction.updateSuccessful(id, key, value));
  } catch (error) {
    yield put(BreachConfigurationAction.updateFailed(error));
  }
}

function* hydrate() {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachConfigurationManager = yield call(
    DependencyLocator.get,
    DEPENDENCY.BREACH_CONFIGURATION_MANAGER
  );

  try {
    const result = yield call(breachConfigurationManager.getAll);
    yield put(BreachConfigurationAction.hydrateSucceeded(result));
  } catch (error) {
    yield put(BreachConfigurationAction.hydrateFailed());
  }
}

function* watchBreachConfigurationActions() {
  yield takeEvery(BreachConfigurationAction.hydrate, hydrate);
  yield takeEvery(BreachConfigurationAction.update, updatedBreachConfiguration);
}

const BreachConfigurationSaga = {
  watchBreachConfigurationActions,
  hydrate,
  updatedBreachConfiguration,
};

export {
  BreachConfigurationReducer,
  BreachConfigurationAction,
  BreachConfigurationSaga,
  BreachConfigurationSelector,
};
