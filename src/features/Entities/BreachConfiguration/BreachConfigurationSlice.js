import { createSlice } from '@reduxjs/toolkit';
import { takeEvery, getContext, call, put } from 'redux-saga/effects';

import { REDUCER, DEPENDENCY } from '~constants';

const initialState = {
  byId: {
    // exampleId: {
    //   id: '',
    //   minimumTemperature: 1,
    //   maximumTemperature: 1,
    //   duration: 1,
    //   description: '',
    // },
  },
  ids: [],
};

const reducers = {
  fetchAll: () => {},
  fetchAllSuccess: {
    prepare: configs => ({ payload: { configs } }),
    reducer: (draftState, { payload: { configs } }) => {
      const byId = configs.reduce((acc, value) => {
        return { ...acc, [value.id]: value };
      }, {});
      const ids = configs.map(({ id }) => id);

      draftState.byId = byId;
      draftState.ids = ids;
    },
  },
  fetchAllFail: () => {},

  update: {
    reducer: () => {},
    prepare: (id, key, value) => ({ payload: { id, key, value } }),
  },
  updateSuccess: {
    reducer: (draftState, { payload: { id, key, value } }) => {
      draftState.byId[id] = { ...draftState.byId[id], [key]: value };
    },
    prepare: (id, key, value) => ({ payload: { id, key, value } }),
  },
  updateFail: () => {},
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
  byId: ({ entities: { breachConfiguration } }) => {
    return breachConfiguration.byId;
  },
};

function* update({ payload: { id, key, value } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const configManager = yield call(DependencyLocator.get, DEPENDENCY.BREACH_CONFIGURATION_MANAGER);
  try {
    yield call(configManager.updateField, id, key, value);
    yield put(BreachConfigurationAction.updateSuccess(id, key, value));
  } catch (error) {
    yield put(BreachConfigurationAction.updateFail(error));
  }
}

function* fetchAll() {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const configManager = yield call(DependencyLocator.get, DEPENDENCY.BREACH_CONFIGURATION_MANAGER);
  try {
    const result = yield call(configManager.getAll);
    yield put(BreachConfigurationAction.fetchAllSuccess(result));
  } catch (error) {
    yield put(BreachConfigurationAction.fetchAllFail());
  }
}

function* root() {
  yield takeEvery(BreachConfigurationAction.fetchAll, fetchAll);
  yield takeEvery(BreachConfigurationAction.update, update);
}

const BreachConfigurationSaga = {
  root,
  fetchAll,
  update,
};

export {
  BreachConfigurationReducer,
  BreachConfigurationAction,
  BreachConfigurationSaga,
  BreachConfigurationSelector,
};
