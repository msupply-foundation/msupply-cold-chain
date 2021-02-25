import { createSlice } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import { put, takeEvery, getContext, call } from 'redux-saga/effects';
import { RootState } from '../../../common/store/store';
import { DEPENDENCY, SETTING, REDUCER } from '../../../common/constants';

interface SettingEntity {
  key: string;
  value: string;
  id: string;
}

interface SettingSliceState {
  [settingKey: string]: string | null;
}

interface PrepareActionReturn<SomePayload> {
  payload: SomePayload;
}

interface SettingUpdateAction {
  type: string;
  payload: { key: string; value: string | number };
}

const initialState: SettingSliceState = {
  [SETTING.INT.DEFAULT_LOG_INTERVAL]: null,
};

const reducers = {
  fetchAll: () => {},
  fetchAllSuccess: {
    prepare: (settings: SettingEntity[]) => ({ payload: { settings } }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { settings } }: PrepareActionReturn<{ settings: SettingEntity[] }>
    ) => {
      settings.forEach(({ key, value }) => {
        draftState[key] = JSON.parse(value);
      });
    },
  },
  fetchAllFail: () => {},

  update: {
    prepare: (key: string, value: string | number) => ({ payload: { key, value } }),
    reducer: () => {},
  },
  updateSuccess: {
    prepare: (setting: SettingEntity) => ({ payload: { setting } }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { setting } }: PrepareActionReturn<{ setting: SettingEntity }>
    ) => {
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
  defaultLogInterval: ({ entities: { setting } }: RootState): string | null => {
    const { [SETTING.INT.DEFAULT_LOG_INTERVAL]: defaultLogInterval } = setting as SettingSliceState;
    return defaultLogInterval;
  },
};

function* fetchAll(): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const settingsManager = yield call(DependencyLocator.get, DEPENDENCY.SETTING_MANAGER);

  try {
    const settings = (yield call(settingsManager.getSettings)) as SettingEntity[];
    yield put(SettingAction.fetchAllSuccess(settings));
  } catch (error) {
    yield put(SettingAction.fetchAllFail());
  }
}

function* update({ payload: { key, value } }: SettingUpdateAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const settingsManager = yield call(DependencyLocator.get, DEPENDENCY.SETTING_MANAGER);
  try {
    const setting = yield call(settingsManager.setSetting, key, JSON.stringify(value));
    yield put(SettingAction.updateSuccess(setting));
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
