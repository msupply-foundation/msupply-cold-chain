import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import {
  getContext,
  call,
  delay,
  put,
  takeEvery,
  takeLeading,
  select,
  take,
  race,
} from 'redux-saga/effects';

import { SettingAction, SettingSelector } from '../Entities';
import { SyncSettingSlice } from '../Entities/Setting/SettingSlice';
import { DEPENDENCY, MILLISECONDS, REDUCER } from '../../common/constants';
import { RootState } from '../../common/store/store';
import { SyncLog } from '../../common/services/Database/entities';

interface SyncSliceState {
  isSyncing: boolean;
}

const initialState: SyncSliceState = {
  isSyncing: false,
};

export interface UpdateIsSyncingActionPayload {
  isSyncing: boolean;
}

export interface UpdateIsSyncingAction {
  type: string;
  payload: UpdateIsSyncingActionPayload;
}

export interface AuthenticateActionPayload {
  loginUrl: string;
  username: string;
  password: string;
}

export interface AuthenticateAction {
  type: string;
  payload: AuthenticateActionPayload;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AuthenticateSuccessActionPayload {}

export interface AuthenticateSuccessAction {
  type: string;
  payload: AuthenticateSuccessActionPayload;
}

export interface SyncSensorsActionPayload {
  sensorUrl: string;
}

export interface SyncSensorsAction {
  type: string;
  payload: SyncSensorsActionPayload;
}

export interface SyncSensorsSuccessActionPayload {
  syncLogs: SyncLog[];
}

export interface SyncSensorsSuccessAction {
  type: string;
  payload: SyncSensorsSuccessActionPayload;
}

export interface SyncTemperatureLogsActionPayload {
  temperatureLogUrl: string;
}

export interface SyncTemperatureLogsAction {
  type: string;
  payload: SyncTemperatureLogsActionPayload;
}

export interface SyncTemperatureLogsSuccessActionPayload {
  syncLogs: SyncLog[];
}

export interface SyncTemperatureLogsSuccessAction {
  type: string;
  payload: SyncTemperatureLogsSuccessActionPayload;
}

export interface SyncTemperatureBreachesActionPayload {
  temperatureBreachUrl: string;
}

export interface SyncTemperatureBreachesAction {
  type: string;
  payload: SyncTemperatureBreachesActionPayload;
}

export interface SyncTemperatureBreachesSuccessActionPayload {
  syncLogs: SyncLog[];
}

export interface SyncTemperatureBreachesSuccessAction {
  type: string;
  payload: SyncTemperatureBreachesSuccessActionPayload;
}

export interface FetchAllSuccessActionPayload {
  loginUrl: string;
  sensorUrl: string;
  temperatureLogUrl: string;
  temperatureBreachUrl: string;
  username: string;
  password: string;
  lastSync: number;
  isPassiveSyncEnabled: boolean;
}

export interface FetchAllAction {
  type: string;
  payload: FetchAllSuccessActionPayload;
}

export interface SyncAllActionPayload {
  loginUrl: string;
  sensorUrl: string;
  temperatureLogUrl: string;
  temperatureBreachUrl: string;
  username: string;
  password: string;
}

export interface SyncAllAction {
  type: string;
  payload: SyncAllActionPayload;
}

export interface SyncingErrorActionPayload {
  error: string;
}

export interface PrepareActionReturn<SomePayload> {
  payload: SomePayload;
}

const reducers = {
  updateIsSyncing: {
    prepare: (isSyncing: boolean): PrepareActionReturn<UpdateIsSyncingActionPayload> => ({
      payload: { isSyncing },
    }),
    reducer: (
      draftState: SyncSliceState,
      { payload: { isSyncing } }: PayloadAction<UpdateIsSyncingActionPayload>
    ) => {
      draftState.isSyncing = isSyncing;
    },
  },
  authenticate: {
    prepare: (
      loginUrl: string,
      username: string,
      password: string
    ): PrepareActionReturn<AuthenticateActionPayload> => ({
      payload: { loginUrl, username, password },
    }),
    reducer: () => {},
  },
  authenticateSuccess: () => {},
  authenticateFailure: () => {},
  syncSensors: {
    prepare: (sensorUrl: string): PrepareActionReturn<SyncSensorsActionPayload> => ({
      payload: { sensorUrl },
    }),
    reducer: () => {},
  },
  syncSensorsSuccess: {
    prepare: (syncLogs: SyncLog[]): PrepareActionReturn<SyncSensorsSuccessActionPayload> => ({
      payload: { syncLogs },
    }),
    reducer: () => {},
  },
  syncSensorsFailure: () => {},
  syncTemperatureLogs: {
    prepare: (
      temperatureLogUrl: string
    ): PrepareActionReturn<SyncTemperatureLogsActionPayload> => ({
      payload: { temperatureLogUrl },
    }),
    reducer: () => {},
  },
  syncTemperatureLogsSuccess: {
    prepare: (
      syncLogs: SyncLog[]
    ): PrepareActionReturn<SyncTemperatureLogsSuccessActionPayload> => ({
      payload: { syncLogs },
    }),
    reducer: () => {},
  },
  syncTemperatureLogsFailure: () => {},
  syncTemperatureBreaches: {
    prepare: (
      temperatureBreachUrl: string
    ): PrepareActionReturn<SyncTemperatureBreachesActionPayload> => ({
      payload: { temperatureBreachUrl },
    }),
    reducer: () => {},
  },
  syncTemperatureBreachesSuccess: {
    prepare: (
      syncLogs: SyncLog[]
    ): PrepareActionReturn<SyncTemperatureBreachesSuccessActionPayload> => ({
      payload: { syncLogs },
    }),
    reducer: () => {},
  },
  syncTemperatureBreachesFailure: () => {},
  syncAll: {
    prepare: (
      loginUrl: string,
      sensorUrl: string,
      temperatureLogUrl: string,
      temperatureBreachUrl: string,
      username: string,
      password: string
    ): PrepareActionReturn<SyncAllActionPayload> => ({
      payload: {
        loginUrl,
        sensorUrl,
        temperatureLogUrl,
        temperatureBreachUrl,
        username,
        password,
      },
    }),
    reducer: () => {},
  },
  enablePassiveSync: () => {},
  disablePassiveSync: () => {},
};

const { actions: SyncAction, reducer: SyncReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.SYNC,
});

const getSliceState = ({ sync }: RootState): SyncSliceState => {
  return sync;
};

const getIsSyncing = (state: RootState): boolean => {
  const { isSyncing } = getSliceState(state);
  return isSyncing;
};

const SyncSelector = {
  getIsSyncing,
};

function* authenticateSuccess(): SagaIterator {
  // TODO.
}

function* authenticateFailure(): SagaIterator {
  // TODO.
}

function* authenticate({
  payload: { loginUrl, username, password },
}: AuthenticateAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);

  try {
    yield call(syncOutManager.login, loginUrl, username, password);
    yield put(SyncAction.authenticateSuccess());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    yield put(SyncAction.authenticateFailure());
  }
}

function* syncSensorsFailure(): SagaIterator {
  // TODO.
}

function* syncSensorsSuccess({ payload: { syncLogs } }: SyncSensorsSuccessAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const utilService = yield call(DependencyLocator.get, DEPENDENCY.UTIL_SERVICE);
  const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
  try {
    yield call(syncQueueManager.dropLogs, syncLogs);
    yield put(SettingAction.updateSyncLastSync(utilService.now()));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    yield call(syncSensorsFailure);
  }
}

function* syncSensors({ payload: { sensorUrl } }: SyncSensorsAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
  const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);

  try {
    const syncLogs = yield call(syncQueueManager.nextSensors);
    yield call(syncOutManager.syncSensors, sensorUrl, syncLogs);
    yield put(SyncAction.syncSensorsSuccess(syncLogs));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    yield call(syncSensorsFailure);
  }
}

function* syncTemperatureLogsFailure(): SagaIterator {
  // TODO.
}

function* syncTemperatureLogsSuccess({
  payload: { syncLogs },
}: SyncTemperatureLogsSuccessAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const utilService = yield call(DependencyLocator.get, DEPENDENCY.UTIL_SERVICE);
  const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
  try {
    yield call(syncQueueManager.dropLogs, syncLogs);
    yield put(SettingAction.updateSyncLastSync(utilService.now()));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    yield call(syncTemperatureLogsFailure);
  }
}

function* syncTemperatureLogs({
  payload: { temperatureLogUrl },
}: SyncTemperatureLogsAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
  const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);

  try {
    const syncLogs = yield call(syncQueueManager.nextTemperatureLogs);
    yield call(syncOutManager.syncTemperatureLogs, temperatureLogUrl, syncLogs);
    yield put(SyncAction.syncTemperatureLogsSuccess(syncLogs));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    yield call(syncTemperatureLogsFailure);
  }
}

function* syncTemperatureBreachesFailure(): SagaIterator {
  // TODO.
}

function* syncTemperatureBreachesSuccess({
  payload: { syncLogs },
}: SyncTemperatureBreachesSuccessAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const utilService = yield call(DependencyLocator.get, DEPENDENCY.UTIL_SERVICE);
  const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
  try {
    yield call(syncQueueManager.dropLogs, syncLogs);
    yield put(SettingAction.updateSyncLastSync(utilService.now()));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    yield call(syncTemperatureBreachesFailure);
  }
}

function* syncTemperatureBreaches({
  payload: { temperatureBreachUrl },
}: SyncTemperatureBreachesAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
  const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);

  try {
    const syncLogs = yield call(syncQueueManager.nextTemperatureBreaches);
    yield call(syncOutManager.syncTemperatureBreaches, temperatureBreachUrl, syncLogs);
    yield put(SyncAction.syncTemperatureBreachesSuccess(syncLogs));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    yield put(SyncAction.syncTemperatureBreachesFailure());
  }
}

function* syncAll({
  payload: { loginUrl, sensorUrl, temperatureLogUrl, temperatureBreachUrl, username, password },
}: SyncAllAction): SagaIterator {
  yield put(SyncAction.updateIsSyncing(true));
  yield put(SyncAction.authenticate(loginUrl, username, password));
  const authenticateResult = yield take([
    SyncAction.authenticateSuccess,
    SyncAction.authenticateFailure,
  ]);
  if (authenticateResult.type === SyncAction.authenticateSuccess.type) {
    yield put(SyncAction.syncSensors(sensorUrl));
    yield take([SyncAction.syncSensorsSuccess, SyncAction.syncSensorsFailure]);
    yield put(SyncAction.syncTemperatureLogs(temperatureLogUrl));
    yield take([SyncAction.syncSensorsSuccess, SyncAction.syncTemperatureLogsFailure]);
    yield put(SyncAction.syncTemperatureBreaches(temperatureBreachUrl));
    yield take([
      SyncAction.syncTemperatureBreachesSuccess,
      SyncAction.syncTemperatureBreachesFailure,
    ]);
  }
  yield put(SyncAction.updateIsSyncing(false));
}

function* startSyncScheduler(): SagaIterator {
  while (true) {
    const {
      [SyncSettingSlice.AuthUrl]: authUrl,
      [SyncSettingSlice.SensorUrl]: sensorUrl,
      [SyncSettingSlice.TemperatureLogUrl]: temperatureLogUrl,
      [SyncSettingSlice.TemperatureBreachUrl]: temperatureBreachUrl,
      [SyncSettingSlice.AuthUsername]: username,
      [SyncSettingSlice.AuthPassword]: password,
    } = yield select(SettingSelector.getSyncSettings);
    yield put(
      SyncAction.syncAll(
        authUrl,
        sensorUrl,
        temperatureLogUrl,
        temperatureBreachUrl,
        username,
        password
      )
    );
    yield delay(MILLISECONDS.ONE_MINUTE);
  }
}

function* enablePassiveSync(): SagaIterator {
  yield race({
    start: call(startSyncScheduler),
    stop: take(SyncAction.disablePassiveSync),
  });
}

function* root(): SagaIterator {
  yield takeEvery(SyncAction.authenticate, authenticate);
  yield takeEvery(SyncAction.authenticateSuccess, authenticateSuccess);
  yield takeEvery(SyncAction.authenticateFailure, authenticateFailure);
  yield takeEvery(SyncAction.syncAll, syncAll);
  yield takeEvery(SyncAction.syncSensors, syncSensors);
  yield takeEvery(SyncAction.syncSensorsSuccess, syncSensorsSuccess);
  yield takeEvery(SyncAction.syncSensorsFailure, syncSensorsFailure);
  yield takeEvery(SyncAction.syncTemperatureLogs, syncTemperatureLogs);
  yield takeEvery(SyncAction.syncTemperatureLogsSuccess, syncTemperatureLogsSuccess);
  yield takeEvery(SyncAction.syncTemperatureLogsFailure, syncTemperatureLogsFailure);
  yield takeEvery(SyncAction.syncTemperatureBreaches, syncTemperatureBreaches);
  yield takeEvery(SyncAction.syncTemperatureBreachesSuccess, syncTemperatureBreachesSuccess);
  yield takeEvery(SyncAction.syncTemperatureBreachesFailure, syncTemperatureBreachesFailure);

  yield takeLeading(SyncAction.enablePassiveSync, enablePassiveSync);
}

const SyncSaga = { root, syncAll };

export { SyncAction, SyncReducer, SyncSaga, SyncSelector };
