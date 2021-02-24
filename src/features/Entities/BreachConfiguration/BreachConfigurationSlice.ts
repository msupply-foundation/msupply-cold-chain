import { SagaIterator } from '@redux-saga/types';
import { createSlice } from '@reduxjs/toolkit';
import { takeEvery, getContext, call, put } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '../../../common/constants';
import { RootState } from '../../../common/store/store';

interface ById<T> {
  [id: string]: T;
}

interface BreachConfigurationState {
  id: string;
  minimumTemperature: number;
  maximumTemperature: number;
  duration: number;
  description: string;
}

interface BreachConfigurationSliceState {
  byId: ById<BreachConfigurationState>;
  ids: string[];
}

interface BreachConfigurationUpdateAction {
  type: string;
  payload: {
    id: string;
    key: string;
    value: string | number;
  };
}

const initialState = {
  byId: {},
  ids: [],
};

const reducers = {
  fetchAll: () => {},
  fetchAllSuccess: {
    prepare: (configs: BreachConfigurationState[]) => ({ payload: { configs } }),
    reducer: (
      draftState: BreachConfigurationSliceState,
      { payload: { configs } }: { payload: { configs: BreachConfigurationState[] } }
    ) => {
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
    prepare: (id: string, key: string, value: string | number) => ({ payload: { id, key, value } }),
  },
  updateSuccess: {
    reducer: (
      draftState: BreachConfigurationSliceState,
      {
        payload: { id, key, value },
      }: { payload: { id: string; key: string; value: string | number } }
    ) => {
      draftState.byId[id] = { ...draftState.byId[id], [key]: value };
    },
    prepare: (id: string, key: string, value: number | string) => ({ payload: { id, key, value } }),
  },
  updateFail: () => {},
};

const { actions: BreachConfigurationAction, reducer: BreachConfigurationReducer } = createSlice({
  name: REDUCER.BREACH_CONFIGURATION,
  initialState,
  reducers,
});

const BreachConfigurationSelector = {
  hotBreachConfig: ({ entities: { breachConfiguration } }: RootState): BreachConfigurationState => {
    const { byId } = breachConfiguration as BreachConfigurationSliceState;
    return byId.HOT_BREACH;
  },
  coldBreachConfig: ({
    entities: { breachConfiguration },
  }: RootState): BreachConfigurationState => {
    const { byId } = breachConfiguration as BreachConfigurationSliceState;
    return byId.COLD_BREACH;
  },
  hotCumulativeConfig: ({
    entities: { breachConfiguration },
  }: RootState): BreachConfigurationState => {
    const { byId } = breachConfiguration as BreachConfigurationSliceState;
    return byId.HOT_CUMULATIVE;
  },
  coldCumulativeConfig: ({
    entities: { breachConfiguration },
  }: RootState): BreachConfigurationState => {
    const { byId } = breachConfiguration as BreachConfigurationSliceState;
    return byId.COLD_CUMULATIVE;
  },
  byId: ({ entities: { breachConfiguration } }: RootState): ById<BreachConfigurationState> => {
    const { byId } = breachConfiguration as BreachConfigurationSliceState;
    return byId;
  },
};

function* update({ payload: { id, key, value } }: BreachConfigurationUpdateAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const configManager = yield call(DependencyLocator.get, DEPENDENCY.BREACH_CONFIGURATION_MANAGER);
  try {
    yield call(configManager.updateField, id, key, value);
    yield put(BreachConfigurationAction.updateSuccess(id, key, value));
  } catch (error) {
    yield put(BreachConfigurationAction.updateFail());
  }
}

function* fetchAll(): SagaIterator {
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
