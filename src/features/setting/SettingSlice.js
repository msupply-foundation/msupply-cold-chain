import { put, takeEvery, getContext, call } from 'redux-saga/effects';
import { createSlice } from '@reduxjs/toolkit';

import { DEPENDENCY, SETTING, REDUCER } from '~constants';

const initialState = {
  [SETTING.INT.DEFAULT_LOG_INTERVAL]: null,
  [SETTING.INT.DOWNLOAD_INTERVAL]: null,
  [SETTING.BOOL.AUTO_APPLY_BREACH_CONFIGS]: null,
};

const reducers = {
  hydrate: () => {},
  hydrateSucceeded: {
    reducer: (draftState, { payload: { settings } }) => {
      settings.forEach(({ key, value }) => {
        draftState[key] = JSON.parse(value);
      });
    },
    prepare: settings => ({ payload: { settings } }),
  },
  hydrateFailed: () => {},

  updatedSetting: {
    reducer: () => {},
    prepare: (key, value) => ({ payload: { key, value } }),
  },
  updatedSettingSucceeded: {
    reducer: (draftState, { payload: { setting } }) => {
      draftState[setting.key] = JSON.parse(setting.value);
    },
    prepare: setting => ({ payload: { setting } }),
  },
  updatedSettingFailed: () => {},
};

const { actions: SettingAction, reducer: SettingReducer } = createSlice({
  name: REDUCER.SETTING,
  initialState,
  reducers,
});

const SettingSelector = {
  defaultLogInterval: ({ setting }) => {
    const { [SETTING.INT.DEFAULT_LOG_INTERVAL]: defaultLogInterval } = setting;
    return defaultLogInterval;
  },
  downloadInterval: ({ setting }) => {
    const { [SETTING.INT.DOWNLOAD_INTERVAL]: defaultDownloadInterval } = setting;
    return defaultDownloadInterval;
  },
};

function* hydrate() {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const settingsManager = yield call(DependencyLocator.get, DEPENDENCY.SETTING_MANAGER);

  try {
    const settings = yield call(settingsManager.getSettings);
    yield put(SettingAction.hydrateSucceeded(settings));
  } catch (error) {
    yield put(SettingAction.hydrateFailed());
  }
}

function* updateSetting({ payload: { key, value } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const settingsManager = yield call(DependencyLocator.get, DEPENDENCY.SETTING_MANAGER);

  try {
    const setting = yield call(settingsManager.setSetting, key, JSON.stringify(value));
    yield put(SettingAction.updatedSettingSucceeded(setting));
  } catch (error) {
    yield put(SettingAction.updatedSettingFailed());
  }
}

function* watchSettingActions() {
  yield takeEvery(SettingAction.hydrate, hydrate);
  yield takeEvery(SettingAction.updatedSetting, updateSetting);
}

const SettingSaga = { watchSettingActions, updateSetting, hydrate };

export { SettingAction, SettingReducer, SettingSelector, SettingSaga };
