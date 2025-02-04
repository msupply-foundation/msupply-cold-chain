import { createSlice } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import { put, takeEvery, getContext, call } from 'redux-saga/effects';
import { RootState } from '~store/store';
import { SettingKey, SettingManager, SettingMap } from '~features/Entities/Setting';
import { DEPENDENCY, REDUCER } from '~constants';
import { PrepareActionReturn } from '~common/types/common';

type SettingStateShape = SettingMap;

const initialState: SettingStateShape = {
  defaultLogInterval: 0,
  serverUrl: '',
  authUsername: '',
  authPassword: '',
  lastSync: 0,
  lastSyncStart: 0,
  isPassiveSyncEnabled: false,
  isIntegrating: false,
  logLevel: 'info',
  debugLogEnabled: false,
};

interface SettingUpdatePayload {
  key: SettingKey;
  value: string | number | boolean;
}
interface SettingUpdateAction {
  type: string;
  payload: SettingUpdatePayload;
}

const reducers = {
  fetchAll: () => {},
  initialiseLogging: () => {},
  fetchAllSuccess: {
    prepare: (settings: SettingMap) => ({ payload: { settings } }),
    reducer: (
      _: SettingStateShape,
      { payload: { settings } }: PrepareActionReturn<{ settings: SettingMap }>
    ) => {
      return settings;
    },
  },

  fetchAllFail: () => {},
  update: {
    prepare: (key: SettingKey, value: string | number | boolean) => ({ payload: { key, value } }),
    reducer: () => {},
  },
  updateSuccess: {
    prepare: (
      key: SettingKey,
      value: string | number | boolean
    ): PrepareActionReturn<SettingUpdatePayload> => ({
      payload: { key, value },
    }),
    reducer: (
      draftState: SettingStateShape,
      { payload: { key, value } }: PrepareActionReturn<SettingUpdatePayload>
    ) => {
      return { ...draftState, [key]: value };
    },
  },
  updateFail: () => {},
};

const { actions: SettingAction, reducer: SettingReducer } = createSlice({
  name: REDUCER.SETTING,
  initialState,
  reducers,
});

const getSettings = (rootState: RootState): SettingStateShape => {
  const { entities } = rootState;
  const { setting } = entities;

  return setting;
};

const getDefaultLogInterval = (rootState: RootState): number => {
  const { defaultLogInterval } = getSettings(rootState);
  return defaultLogInterval;
};

const getServerUrl = (rootState: RootState): string => {
  const { serverUrl } = getSettings(rootState);
  return serverUrl;
};

const getAuthUsername = (rootState: RootState): string | null => {
  const { authUsername } = getSettings(rootState);
  return authUsername;
};

const getAuthPassword = (rootState: RootState): string => {
  const { authPassword } = getSettings(rootState);
  return authPassword;
};

const getLogLevel = (rootState: RootState): string => {
  const { logLevel } = getSettings(rootState);
  return logLevel;
};

const SettingSelector = {
  getSettings,
  getDefaultLogInterval,
  getServerUrl,
  getAuthUsername,
  getAuthPassword,
  getLogLevel,
};

function* fetchAll(): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const settingsManager: SettingManager = yield call(
    DependencyLocator.get,
    DEPENDENCY.SETTING_MANAGER
  );

  try {
    const settings: SettingMap = yield call(settingsManager.getSettings);

    yield put(SettingAction.fetchAllSuccess(settings));
  } catch (error) {
    yield put(SettingAction.fetchAllFail());
  }
}

function* update({ payload: { key, value } }: SettingUpdateAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const settingsManager = yield call(DependencyLocator.get, DEPENDENCY.SETTING_MANAGER);
  try {
    yield call(settingsManager.setSetting, key, value);
    yield put(SettingAction.updateSuccess(key, value));
  } catch (error) {
    yield put(SettingAction.updateFail());
  }
}

function* root(): SagaIterator {
  yield takeEvery(SettingAction.fetchAll, fetchAll);
  yield takeEvery(SettingAction.update, update);
}

const SettingSaga = { root, update, fetchAll };

export { SettingAction, SettingReducer, SettingSelector, SettingSaga };
