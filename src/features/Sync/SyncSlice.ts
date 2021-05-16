import { ToastAndroid } from 'react-native';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import {
  getContext,
  call,
  delay,
  put,
  takeEvery,
  takeLeading,
  take,
  race,
  takeLatest,
} from 'redux-saga/effects';
import { SettingAction, SettingManager, SyncSettingMap } from '~features/Entities/Setting';
import { DEPENDENCY, MILLISECONDS, REDUCER } from '~constants';
import { RootState } from '~store/store';
import { SyncLog } from '~services/Database/entities';
import { SyncQueueManager } from '~features/Sync/SyncQueueManager';

interface SyncSliceState {
  isSyncing: boolean;
  syncQueueLength: number;
}

const initialState: SyncSliceState = {
  isSyncing: false,
  syncQueueLength: 0,
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

export interface FailurePayload {
  errorMessage: string;
}

export interface SyncSensorsFailureAction {
  type: string;
  payload: FailurePayload;
}

export interface SyncTemperatureLogsFailureAction {
  type: string;
  payload: FailurePayload;
}

export interface SyncTemperatureBreachesFailureAction {
  type: string;
  payload: FailurePayload;
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

export type SyncAllPayload = Omit<
  SyncSettingMap,
  'lastSync' | 'isPassiveSyncEnabled' | 'isIntegrating'
>;
export interface SyncAllAction {
  type: string;
  payload: SyncAllPayload;
}

export interface SyncingErrorActionPayload {
  error: string;
}

export interface CountSyncQueuePayload {
  count: number;
}
export interface PrepareActionReturn<SomePayload> {
  payload: SomePayload;
}

const reducers = {
  tryCountSyncQueue: () => {},
  countSyncQueueSuccess: {
    prepare: (count: number): PrepareActionReturn<CountSyncQueuePayload> => ({
      payload: { count },
    }),
    reducer: (
      draftState: SyncSliceState,
      { payload: { count } }: PrepareActionReturn<CountSyncQueuePayload>
    ) => {
      draftState.syncQueueLength = count;
    },
  },
  countSyncQueueFailure: {
    prepare: (errorMessage: string): PrepareActionReturn<FailurePayload> => ({
      payload: { errorMessage },
    }),
    reducer: () => {},
  },
  tryStartPassiveIntegration: () => {},
  tryTestConnection: {
    prepare: (
      loginUrl: string,
      username: string,
      password: string
    ): PrepareActionReturn<AuthenticateActionPayload> => ({
      payload: { username, password, loginUrl },
    }),
    reducer: () => {},
  },
  testConnectionSuccess: () => {},
  testConnectionFailure: {
    prepare: (errorMessage: string): PrepareActionReturn<FailurePayload> => ({
      payload: { errorMessage },
    }),
    reducer: () => {},
  },
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
  syncSensorsFailure: {
    prepare: (errorMessage: string): PrepareActionReturn<FailurePayload> => ({
      payload: { errorMessage },
    }),
    reducer: () => {},
  },
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
  syncTemperatureLogsFailure: {
    prepare: (errorMessage: string): PrepareActionReturn<FailurePayload> => ({
      payload: { errorMessage },
    }),
    reducer: () => {},
  },
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
  syncTemperatureBreachesFailure: {
    prepare: (errorMessage: string): PrepareActionReturn<FailurePayload> => ({
      payload: { errorMessage },
    }),
    reducer: () => {},
  },
  syncAll: {
    prepare: (syncSettings: SyncAllPayload): PrepareActionReturn<SyncAllPayload> => ({
      payload: syncSettings,
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

const getSyncQueueCount = (state: RootState): number => {
  const { syncQueueLength } = getSliceState(state);
  return syncQueueLength;
};

const SyncSelector = {
  getIsSyncing,
  getSyncQueueCount,
};

function* getDependency(key: DEPENDENCY): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const dependency = yield call(dependencyLocator.get, key);

  return dependency;
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
    yield put(SyncAction.authenticateFailure());
  }
}

function* syncSensorsSuccess({ payload: { syncLogs } }: SyncSensorsSuccessAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const utilService = yield call(DependencyLocator.get, DEPENDENCY.UTIL_SERVICE);
  const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
  try {
    yield call(syncQueueManager.dropLogs, syncLogs);
    yield put(SettingAction.update('lastSync', utilService.now()));
  } catch (e) {
    console.log(e.message);
    yield put(SyncAction.syncSensorsFailure(e.message));
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
    console.log('SyncSensors', e.message);
    yield put(SyncAction.syncSensorsFailure(e.message));
  }
}

function* syncTemperatureLogsSuccess({
  payload: { syncLogs },
}: SyncTemperatureLogsSuccessAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const utilService = yield call(DependencyLocator.get, DEPENDENCY.UTIL_SERVICE);
  const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
  try {
    yield call(syncQueueManager.dropLogs, syncLogs);
    yield put(SettingAction.update('lastSync', utilService.now()));
  } catch (e) {
    console.log(e.message);
    yield put(SyncAction.syncTemperatureLogsFailure(e.message));
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
    console.log(e.message);
    yield put(SyncAction.syncTemperatureLogsFailure(e.message));
  }
}

function* syncTemperatureBreachesSuccess({
  payload: { syncLogs },
}: SyncTemperatureBreachesSuccessAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const utilService = yield call(DependencyLocator.get, DEPENDENCY.UTIL_SERVICE);
  const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
  try {
    yield call(syncQueueManager.dropLogs, syncLogs);
    yield put(SettingAction.update('lastSync', utilService.now()));
  } catch (e) {
    console.log(e.message);
    yield put(SyncAction.syncTemperatureBreachesFailure(e.message));
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
    console.log(e.message);
    yield put(SyncAction.syncTemperatureBreachesFailure(e.message));
  }
}

function* syncAll({
  payload: {
    authUrl,
    sensorUrl,
    temperatureLogUrl,
    temperatureBreachUrl,
    authUsername,
    authPassword,
  },
}: SyncAllAction): SagaIterator {
  yield put(SyncAction.updateIsSyncing(true));
  yield put(SyncAction.authenticate(authUrl, authUsername, authPassword));
  const authenticateResult = yield take([
    SyncAction.authenticateSuccess,
    SyncAction.authenticateFailure,
  ]);
  if (authenticateResult.type === SyncAction.authenticateSuccess.type) {
    yield put(SyncAction.syncSensors(sensorUrl));
    yield take([SyncAction.syncSensorsSuccess, SyncAction.syncSensorsFailure]);
    yield put(SyncAction.syncTemperatureLogs(temperatureLogUrl));
    yield take([SyncAction.syncTemperatureLogsSuccess, SyncAction.syncTemperatureLogsFailure]);
    yield put(SyncAction.syncTemperatureBreaches(temperatureBreachUrl));
    yield take([
      SyncAction.syncTemperatureBreachesSuccess,
      SyncAction.syncTemperatureBreachesFailure,
    ]);
  } else {
  }
  yield put(SyncAction.updateIsSyncing(false));
}

function* startSyncScheduler(): SagaIterator {
  while (true) {
    const settingManager: SettingManager = yield call(getDependency, DEPENDENCY.SETTING_MANAGER);
    const syncSettings: SyncSettingMap = yield call(settingManager.getSyncSettings);

    yield put(SyncAction.syncAll(syncSettings));
    yield delay(MILLISECONDS.ONE_MINUTE);
  }
}

function* enablePassiveSync(): SagaIterator {
  yield race({
    start: call(startSyncScheduler),
    stop: take(SyncAction.disablePassiveSync),
  });
}

function* tryStartPassiveIntegration(): SagaIterator {
  const settingManager: SettingManager = yield call(getDependency, DEPENDENCY.SETTING_MANAGER);
  const isIntegrating = yield call(settingManager.getBool, 'isIntegrating');

  if (isIntegrating) {
    yield put(SyncAction.enablePassiveSync());
  }
}

function* tryTestConnection({
  payload: { loginUrl, username, password },
}: AuthenticateAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);

  try {
    yield call(syncOutManager.login, loginUrl, username, password);
    yield put(SyncAction.testConnectionSuccess());
  } catch (e) {
    yield put(SyncAction.testConnectionFailure(e.message));
  }
}

function* testConnectionFailure({
  payload: { errorMessage },
}: PayloadAction<FailurePayload>): SagaIterator {
  ToastAndroid.show(`Connection could not be established: ${errorMessage}`, ToastAndroid.SHORT);
}

function* testConnectionSuccess(): SagaIterator {
  ToastAndroid.show('Connection established!', ToastAndroid.SHORT);
}

function* tryCountSyncQueue(): SagaIterator {
  const syncQueue: SyncQueueManager = yield call(getDependency, DEPENDENCY.SYNC_QUEUE_MANAGER);

  try {
    const syncCount = yield call(syncQueue.length);
    yield put(SyncAction.countSyncQueueSuccess(syncCount));
  } catch (e) {
    yield put(SyncAction.countSyncQueueFailure(e.message));
  }
}

function* root(): SagaIterator {
  yield takeEvery(SyncAction.tryCountSyncQueue, tryCountSyncQueue);

  yield takeEvery(SyncAction.authenticate, authenticate);

  yield takeEvery(SyncAction.syncAll, syncAll);
  yield takeEvery(SyncAction.syncSensors, syncSensors);
  yield takeEvery(SyncAction.syncTemperatureLogs, syncTemperatureLogs);
  yield takeEvery(SyncAction.syncTemperatureBreaches, syncTemperatureBreaches);

  yield takeEvery(SyncAction.syncSensorsSuccess, syncSensorsSuccess);
  yield takeEvery(SyncAction.syncTemperatureLogsSuccess, syncTemperatureLogsSuccess);
  yield takeEvery(SyncAction.syncTemperatureBreachesSuccess, syncTemperatureBreachesSuccess);

  yield takeLatest(SyncAction.tryTestConnection, tryTestConnection);
  yield takeLatest(SyncAction.testConnectionSuccess, testConnectionSuccess);
  yield takeLatest(SyncAction.testConnectionFailure, testConnectionFailure);

  yield takeLeading(SyncAction.tryStartPassiveIntegration, tryStartPassiveIntegration);
  yield takeLeading(SyncAction.enablePassiveSync, enablePassiveSync);
}

const SyncSaga = {
  root,
  syncAll,
  tryCountSyncQueue,
  authenticate,
  syncSensors,
  syncTemperatureBreaches,
  syncTemperatureLogs,
  syncSensorsSuccess,
  syncTemperatureLogsSuccess,
  syncTemperatureBreachesSuccess,
  tryTestConnection,
  testConnectionFailure,
  testConnectionSuccess,
  tryStartPassiveIntegration,
  enablePassiveSync,
};

export { SyncAction, SyncReducer, SyncSaga, SyncSelector };
