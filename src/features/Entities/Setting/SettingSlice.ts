/* eslint-disable no-shadow */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import { put, takeEvery, getContext, call } from 'redux-saga/effects';
import { RootState } from '../../../common/store/store';
import { DEPENDENCY, REDUCER, SETTING } from '../../../common/constants';

interface SettingEntity {
  key: string;
  value: string;
  id: string;
}

export enum SettingSlice {
  Bluetooth = 'bluetooth',
  Sync = 'sync',
}

export enum BluetoothSettingSlice {
  DefaultLogInterval = 'defaultLogInterval',
}

export enum SyncSettingSlice {
  AuthUrl = 'authUrl',
  AuthUsername = 'authUsername',
  AuthPassword = 'authPassword',
  SensorUrl = 'sensorUrl',
  TemperatureLogUrl = 'temperatureLogUrl',
  TemperatureBreachUrl = 'temperatureBreachUrl',
  LastSync = 'lastSync',
  IsPassiveSyncEnabled = 'isPassiveSyncEnabled',
}

interface SyncSettingSliceState {
  [SyncSettingSlice.AuthUrl]: string | null;
  [SyncSettingSlice.AuthUsername]: string | null;
  [SyncSettingSlice.AuthPassword]: string | null;
  [SyncSettingSlice.SensorUrl]: string | null;
  [SyncSettingSlice.TemperatureLogUrl]: string | null;
  [SyncSettingSlice.TemperatureBreachUrl]: string | null;
  [SyncSettingSlice.LastSync]: number | null;
  [SyncSettingSlice.IsPassiveSyncEnabled]: boolean | null;
}

interface BluetoothSettingSliceState {
  [BluetoothSettingSlice.DefaultLogInterval]: number | null;
}

interface SettingSliceState {
  [SettingSlice.Bluetooth]: BluetoothSettingSliceState;
  [SettingSlice.Sync]: SyncSettingSliceState;
}

type SettingKey = string;
type SettingValue = string | number | boolean | null;

interface SettingUpdateAction {
  type: string;
  payload: { key: SettingKey; value: SettingValue };
}

export interface UpdateBluetoothDefaultLogIntervalActionPayload {
  defaultLogInterval: number;
}

export interface UpdateBluetoothDefaultLogIntervalAction {
  type: string;
  payload: UpdateBluetoothDefaultLogIntervalActionPayload;
}

export interface UpdateSyncAuthUrlActionPayload {
  authUrl: string;
}

export interface UpdateSyncAuthUrlAction {
  type: string;
  payload: UpdateSyncAuthUrlActionPayload;
}

export interface UpdateSyncSensorUrlActionPayload {
  sensorUrl: string;
}
export interface UpdateSyncSensorUrlAction {
  type: string;
  payload: UpdateSyncSensorUrlActionPayload;
}

export interface UpdateSyncTemperatureLogUrlActionPayload {
  temperatureLogUrl: string;
}
export interface UpdateSyncTemperatureLogUrlAction {
  type: string;
  payload: UpdateSyncTemperatureLogUrlActionPayload;
}

export interface UpdateSyncTemperatureBreachUrlActionPayload {
  temperatureBreachUrl: string;
}
export interface UpdateSyncTemperatureBreachUrlAction {
  type: string;
  payload: UpdateSyncTemperatureBreachUrlActionPayload;
}

export interface UpdateSyncAuthUsernameActionPayload {
  username: string;
}

export interface UpdateSyncAuthUsernameAction {
  type: string;
  payload: UpdateSyncAuthUsernameActionPayload;
}

export interface UpdateSyncAuthPasswordActionPayload {
  password: string;
}

export interface UpdateSyncAuthPasswordAction {
  type: string;
  payload: UpdateSyncAuthPasswordActionPayload;
}

export interface UpdateSyncLastSyncActionPayload {
  lastSync: number;
}

export interface UpdateSyncLastSyncAction {
  type: string;
  payload: UpdateSyncLastSyncActionPayload;
}

export interface UpdateSyncIsPassiveSyncEnabledActionPayload {
  isPassiveSyncEnabled: boolean;
}

export interface UpdateSyncIsPassiveSyncEnabledAction {
  type: string;
  payload: UpdateSyncIsPassiveSyncEnabledActionPayload;
}

export interface PrepareActionReturn<SomePayload> {
  payload: SomePayload;
}

const initialState: SettingSliceState = {
  [SettingSlice.Bluetooth]: {
    [BluetoothSettingSlice.DefaultLogInterval]: null,
  },
  [SettingSlice.Sync]: {
    [SyncSettingSlice.AuthUrl]: null,
    [SyncSettingSlice.AuthUsername]: null,
    [SyncSettingSlice.AuthPassword]: null,
    [SyncSettingSlice.SensorUrl]: null,
    [SyncSettingSlice.TemperatureLogUrl]: null,
    [SyncSettingSlice.TemperatureBreachUrl]: null,
    [SyncSettingSlice.LastSync]: null,
    [SyncSettingSlice.IsPassiveSyncEnabled]: null,
  },
};

const parseSettingSlice = (setting: SettingEntity) => {
  switch (setting.key) {
    case SETTING.BLUETOOTH.DEFAULT_LOG_INTERVAL:
      return SettingSlice.Bluetooth;
    case SETTING.SYNC.AUTH_URL:
    case SETTING.SYNC.AUTH_USERNAME:
    case SETTING.SYNC.AUTH_PASSWORD:
    case SETTING.SYNC.SENSOR_URL:
    case SETTING.SYNC.TEMPERATURE_LOG_URL:
    case SETTING.SYNC.TEMPERATURE_BREACH_URL:
    case SETTING.SYNC.LAST_SYNC:
    case SETTING.SYNC.IS_PASSIVE_SYNC_ENABLED:
      return SettingSlice.Sync;
    default:
      return SettingSlice.Sync;
  }
};

const parseSettingKey = (setting: SettingEntity) => {
  switch (setting.key) {
    case SETTING.BLUETOOTH.DEFAULT_LOG_INTERVAL:
      return BluetoothSettingSlice.DefaultLogInterval;
    case SETTING.SYNC.AUTH_URL:
      return SyncSettingSlice.AuthUrl;
    case SETTING.SYNC.AUTH_USERNAME:
      return SyncSettingSlice.AuthUsername;
    case SETTING.SYNC.AUTH_PASSWORD:
      return SyncSettingSlice.AuthPassword;
    case SETTING.SYNC.SENSOR_URL:
      return SyncSettingSlice.SensorUrl;
    case SETTING.SYNC.TEMPERATURE_LOG_URL:
      return SyncSettingSlice.TemperatureLogUrl;
    case SETTING.SYNC.TEMPERATURE_BREACH_URL:
      return SyncSettingSlice.TemperatureBreachUrl;
    case SETTING.SYNC.LAST_SYNC:
      return SyncSettingSlice.LastSync;
    case SETTING.SYNC.IS_PASSIVE_SYNC_ENABLED:
      return SyncSettingSlice.IsPassiveSyncEnabled;
    default:
      return setting.key;
  }
};

const parseValue = (setting: SettingEntity) => {
  try {
    return JSON.parse(setting.value);
  } catch {
    return setting.value;
  }
};

const reducers = {
  fetchAll: () => {},
  fetchAllSuccess: {
    prepare: (settings: SettingEntity[]) => ({ payload: { settings } }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { settings } }: PrepareActionReturn<{ settings: SettingEntity[] }>
    ) => {
      settings.forEach((setting: SettingEntity) => {
        const settingSlice = parseSettingSlice(setting);
        const settingKey = parseSettingKey(setting);
        const settingValue = parseValue(setting);
        draftState[settingSlice][settingKey] = settingValue;
      });
    },
  },
  fetchAllFail: () => {},
  update: {
    prepare: (key: string, value: string | number | boolean) => ({ payload: { key, value } }),
    reducer: () => {},
  },
  updateSuccess: {
    prepare: (setting: SettingEntity) => ({ payload: { setting } }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { setting } }: PrepareActionReturn<{ setting: SettingEntity }>
    ) => {
      const settingSlice = parseSettingSlice(setting);
      const settingKey = parseSettingKey(setting);
      const settingValue = parseValue(setting);
      draftState[settingSlice][settingKey] = settingValue;
    },
  },
  updateFail: () => {},
  updateBluetoothDefaultLogInterval: {
    prepare: (
      defaultLogInterval: number
    ): PrepareActionReturn<UpdateBluetoothDefaultLogIntervalActionPayload> => ({
      payload: { defaultLogInterval },
    }),
    reducer: (
      draftState: SettingSliceState,
      {
        payload: { defaultLogInterval },
      }: PayloadAction<UpdateBluetoothDefaultLogIntervalActionPayload>
    ) => {
      draftState[SettingSlice.Bluetooth][
        BluetoothSettingSlice.DefaultLogInterval
      ] = defaultLogInterval;
    },
  },
  updateSyncAuthUrl: {
    prepare: (authUrl: string): PrepareActionReturn<UpdateSyncAuthUrlActionPayload> => ({
      payload: { authUrl },
    }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { authUrl } }: PayloadAction<UpdateSyncAuthUrlActionPayload>
    ) => {
      draftState[SettingSlice.Sync][SyncSettingSlice.AuthUrl] = authUrl;
    },
  },
  updateSyncSensorUrl: {
    prepare: (sensorUrl: string): PrepareActionReturn<UpdateSyncSensorUrlActionPayload> => ({
      payload: { sensorUrl },
    }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { sensorUrl } }: PayloadAction<UpdateSyncSensorUrlActionPayload>
    ) => {
      draftState[SettingSlice.Sync][SyncSettingSlice.SensorUrl] = sensorUrl;
    },
  },
  updateSyncTemperatureLogUrl: {
    prepare: (
      temperatureLogUrl: string
    ): PrepareActionReturn<UpdateSyncTemperatureLogUrlActionPayload> => ({
      payload: { temperatureLogUrl },
    }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { temperatureLogUrl } }: PayloadAction<UpdateSyncTemperatureLogUrlActionPayload>
    ) => {
      draftState[SettingSlice.Sync][SyncSettingSlice.TemperatureLogUrl] = temperatureLogUrl;
    },
  },
  updateSyncTemperatureBreachUrl: {
    prepare: (
      temperatureBreachUrl: string
    ): PrepareActionReturn<UpdateSyncTemperatureBreachUrlActionPayload> => ({
      payload: { temperatureBreachUrl },
    }),
    reducer: (
      draftState: SettingSliceState,
      {
        payload: { temperatureBreachUrl },
      }: PayloadAction<UpdateSyncTemperatureBreachUrlActionPayload>
    ) => {
      draftState[SettingSlice.Sync][SyncSettingSlice.TemperatureBreachUrl] = temperatureBreachUrl;
    },
  },
  updateSyncAuthUsername: {
    prepare: (username: string): PrepareActionReturn<UpdateSyncAuthUsernameActionPayload> => ({
      payload: { username },
    }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { username } }: PayloadAction<UpdateSyncAuthUsernameActionPayload>
    ) => {
      draftState[SettingSlice.Sync][SyncSettingSlice.AuthUsername] = username;
    },
  },
  updateSyncAuthPassword: {
    prepare: (password: string): PrepareActionReturn<UpdateSyncAuthPasswordActionPayload> => ({
      payload: { password },
    }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { password } }: PayloadAction<UpdateSyncAuthPasswordActionPayload>
    ) => {
      draftState[SettingSlice.Sync][SyncSettingSlice.AuthPassword] = password;
    },
  },
  updateSyncLastSync: {
    prepare: (lastSync: number): PrepareActionReturn<UpdateSyncLastSyncActionPayload> => ({
      payload: { lastSync },
    }),
    reducer: (
      draftState: SettingSliceState,
      { payload: { lastSync } }: PayloadAction<UpdateSyncLastSyncActionPayload>
    ) => {
      draftState[SettingSlice.Sync][SyncSettingSlice.LastSync] = lastSync;
    },
  },
  updateSyncIsPassiveSyncEnabled: {
    prepare: (
      isPassiveSyncEnabled: boolean
    ): PrepareActionReturn<UpdateSyncIsPassiveSyncEnabledActionPayload> => ({
      payload: { isPassiveSyncEnabled },
    }),
    reducer: (
      draftState: SettingSliceState,
      {
        payload: { isPassiveSyncEnabled },
      }: PayloadAction<UpdateSyncIsPassiveSyncEnabledActionPayload>
    ) => {
      draftState[SettingSlice.Sync][SyncSettingSlice.IsPassiveSyncEnabled] = isPassiveSyncEnabled;
    },
  },
};

const { actions: SettingAction, reducer: SettingReducer } = createSlice({
  name: REDUCER.SETTING,
  initialState,
  reducers,
});

const getSettings = (rootState: RootState): SettingSliceState => {
  const { entities } = rootState;
  const { setting } = entities;
  return setting;
};

const getBluetoothSettings = (rootState: RootState): BluetoothSettingSliceState => {
  const { [SettingSlice.Bluetooth]: bluetooth } = getSettings(rootState);
  return bluetooth;
};

const getSyncSettings = (rootState: RootState): SyncSettingSliceState => {
  const { [SettingSlice.Sync]: sync } = getSettings(rootState);
  return sync;
};

const getBluetoothDefaultLogInterval = (rootState: RootState): number | null => {
  const {
    [BluetoothSettingSlice.DefaultLogInterval]: bluetoothDefaultLogInterval,
  } = getBluetoothSettings(rootState);
  return bluetoothDefaultLogInterval as number | null;
};

const getSyncAuthUrl = (rootState: RootState): string | null => {
  const { [SyncSettingSlice.AuthUrl]: syncAuthUrl } = getSyncSettings(rootState);
  return syncAuthUrl as string | null;
};

const getSyncAuthUsername = (rootState: RootState): string | null => {
  const { [SyncSettingSlice.AuthUsername]: syncAuthUsername } = getSyncSettings(rootState);
  return syncAuthUsername as string | null;
};

const getSyncAuthPassword = (rootState: RootState): string | null => {
  const { [SyncSettingSlice.AuthPassword]: syncAuthPassword } = getSyncSettings(rootState);
  return syncAuthPassword as string | null;
};

const getSyncSensorUrl = (rootState: RootState): string | null => {
  const { [SyncSettingSlice.SensorUrl]: syncSensorUrl } = getSyncSettings(rootState);
  return syncSensorUrl as string | null;
};

const getSyncTemperatureLogUrl = (rootState: RootState): string | null => {
  const { [SyncSettingSlice.TemperatureLogUrl]: syncTemperatureLogUrl } = getSyncSettings(
    rootState
  );
  return syncTemperatureLogUrl as string | null;
};

const getSyncTemperatureBreachUrl = (rootState: RootState): string | null => {
  const { [SyncSettingSlice.TemperatureBreachUrl]: syncTemperatureBreachUrl } = getSyncSettings(
    rootState
  );
  return syncTemperatureBreachUrl as string | null;
};

const SettingSelector = {
  getBluetoothSettings,
  getSyncSettings,
  getBluetoothDefaultLogInterval,
  getSyncAuthUrl,
  getSyncAuthUsername,
  getSyncAuthPassword,
  getSyncSensorUrl,
  getSyncTemperatureLogUrl,
  getSyncTemperatureBreachUrl,
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

function* updateBluetoothDefaultLogInterval({
  payload: { defaultLogInterval },
}: UpdateBluetoothDefaultLogIntervalAction): SagaIterator {
  yield put(SettingAction.update(SETTING.BLUETOOTH.DEFAULT_LOG_INTERVAL, defaultLogInterval));
}

function* updateSyncAuthUrl({ payload: { authUrl } }: UpdateSyncAuthUrlAction): SagaIterator {
  yield put(SettingAction.update(SETTING.SYNC.AUTH_URL, authUrl));
}

function* updateSyncSensorUrl({ payload: { sensorUrl } }: UpdateSyncSensorUrlAction): SagaIterator {
  yield put(SettingAction.update(SETTING.SYNC.SENSOR_URL, sensorUrl));
}

function* updateSyncTemperatureLogUrl({
  payload: { temperatureLogUrl },
}: UpdateSyncTemperatureLogUrlAction): SagaIterator {
  yield put(SettingAction.update(SETTING.SYNC.TEMPERATURE_LOG_URL, temperatureLogUrl));
}

function* updateSyncTemperatureBreachUrl({
  payload: { temperatureBreachUrl },
}: UpdateSyncTemperatureBreachUrlAction): SagaIterator {
  yield put(SettingAction.update(SETTING.SYNC.TEMPERATURE_BREACH_URL, temperatureBreachUrl));
}

function* updateSyncAuthUsername({
  payload: { username },
}: UpdateSyncAuthUsernameAction): SagaIterator {
  yield put(SettingAction.update(SETTING.SYNC.AUTH_USERNAME, username));
}

function* updateSyncAuthPassword({
  payload: { password },
}: UpdateSyncAuthPasswordAction): SagaIterator {
  yield put(SettingAction.update(SETTING.SYNC.AUTH_PASSWORD, password));
}

function* updateSyncLastSync({ payload: { lastSync } }: UpdateSyncLastSyncAction): SagaIterator {
  yield put(SettingAction.update(SETTING.SYNC.LAST_SYNC, lastSync));
}

function* updateSyncIsPassiveSyncEnabled({
  payload: { isPassiveSyncEnabled },
}: UpdateSyncIsPassiveSyncEnabledAction): SagaIterator {
  yield put(SettingAction.update(SETTING.SYNC.IS_PASSIVE_SYNC_ENABLED, isPassiveSyncEnabled));
}

function* root(): SagaIterator {
  yield takeEvery(SettingAction.fetchAll, fetchAll);
  yield takeEvery(SettingAction.update, update);
  yield takeEvery(
    SettingAction.updateBluetoothDefaultLogInterval,
    updateBluetoothDefaultLogInterval
  );
  yield takeEvery(SettingAction.updateSyncAuthUrl, updateSyncAuthUrl);
  yield takeEvery(SettingAction.updateSyncAuthUsername, updateSyncAuthUsername);
  yield takeEvery(SettingAction.updateSyncAuthPassword, updateSyncAuthPassword);
  yield takeEvery(SettingAction.updateSyncSensorUrl, updateSyncSensorUrl);
  yield takeEvery(SettingAction.updateSyncTemperatureLogUrl, updateSyncTemperatureLogUrl);
  yield takeEvery(SettingAction.updateSyncTemperatureBreachUrl, updateSyncTemperatureBreachUrl);
  yield takeEvery(SettingAction.updateSyncLastSync, updateSyncLastSync);
  yield takeEvery(SettingAction.updateSyncIsPassiveSyncEnabled, updateSyncIsPassiveSyncEnabled);
}

const SettingSaga = { root, update, fetchAll };

export { SettingAction, SettingReducer, SettingSelector, SettingSaga };
