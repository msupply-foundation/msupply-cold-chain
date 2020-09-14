import { put, takeEvery, getContext, call } from 'redux-saga/effects';
import { createSlice } from '@reduxjs/toolkit';

import { DEPENDENCY, SETTING, REDUCER } from '~constants';

const initialState = {
  [SETTING.INT.DEFAULT_LOG_INTERVAL]: null,
  [SETTING.INT.DOWNLOAD_INTERVAL]: null,
};

const reducers = {
  fetchAll: () => {},
  fetchAllSuccess: {
    prepare: settings => ({ payload: { settings } }),
    reducer: (draftState, { payload: { settings } }) => {
      settings.forEach(({ key, value }) => {
        draftState[key] = JSON.parse(value);
      });
    },
  },
  fetchAllFail: () => {},

  update: {
    prepare: (key, value) => ({ payload: { key, value } }),
    reducer: () => {},
  },
  updateSuccess: {
    prepare: setting => ({ payload: { setting } }),
    reducer: (draftState, { payload: { setting } }) => {
      draftState[setting.key] = JSON.parse(setting.value);
    },
  },
  updateFail: () => {},
};

const { actions: SettingAction, reducer: SettingReducer } = createSlice({
  name: REDUCER.SETTING,
  initialState,
  reducers,
});

const SettingSelector = {
  defaultLogInterval: ({ entities: { setting } }) => {
    const { [SETTING.INT.DEFAULT_LOG_INTERVAL]: defaultLogInterval } = setting;
    return defaultLogInterval;
  },
  downloadInterval: ({ entities: { setting } }) => {
    const { [SETTING.INT.DOWNLOAD_INTERVAL]: defaultDownloadInterval } = setting;
    return defaultDownloadInterval;
  },
};

function* fetchAll() {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const settingsManager = yield call(DependencyLocator.get, DEPENDENCY.SETTING_MANAGER);

  try {
    const settings = yield call(settingsManager.getSettings);
    yield put(SettingAction.fetchAllSuccess(settings));
  } catch (error) {
    yield put(SettingAction.fetchAllFail());
  }
}

function* update({ payload: { key, value } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const settingsManager = yield call(DependencyLocator.get, DEPENDENCY.SETTING_MANAGER);
  try {
    const setting = yield call(settingsManager.setSetting, key, JSON.stringify(value));
    yield put(SettingAction.updateSuccess(setting));
  } catch (error) {
    yield put(SettingAction.updateFail());
  }
}

function* root() {
  yield takeEvery(SettingAction.fetchAll, fetchAll);
  yield takeEvery(SettingAction.update, update);
}

const SettingSaga = { root, update, fetchAll };

export { SettingAction, SettingReducer, SettingSelector, SettingSaga };
