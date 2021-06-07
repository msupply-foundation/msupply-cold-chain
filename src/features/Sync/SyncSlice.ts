import { ToastAndroid } from 'react-native';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import { call, delay, put, takeEvery, takeLeading, take, race } from 'redux-saga/effects';

import { UtilService } from '~services/UtilService';
import { TemperatureLog, TemperatureBreach, Sensor } from '~services/Database/entities';
import { SettingAction, SettingManager, SyncSettingMap } from '~features/Entities/Setting';
import { DEPENDENCY, MILLISECONDS, REDUCER } from '~constants';
import { RootState } from '~store/store';
import { getDependency } from '~features/utils/saga';

import { SyncQueueManager } from '~features/Sync/SyncQueueManager';
import { SyncOutManager } from '~features/Sync/SyncOutManager';

import {
  SyncSliceStateShape,
  CountSyncQueuePayload,
  AuthenticateActionPayload,
  UpdateIsSyncingActionPayload,
  SyncAllPayload,
  SyncSensorsActionPayload,
  SyncTemperatureLogsActionPayload,
  SyncTemperatureBreachesActionPayload,
  FailurePayload,
  SyncSuccessPayload,
} from './types';
import { PrepareActionReturn } from '~common/types/common';

const initialState: SyncSliceStateShape = {
  isSyncing: false,
  syncQueueLength: 0,
};

const reducers = {
  tryCountSyncQueue: () => {},
  countSyncQueueSuccess: {
    prepare: (count: number) => ({ payload: { count } }),
    reducer: (
      draftState: SyncSliceStateShape,
      { payload: { count } }: PrepareActionReturn<CountSyncQueuePayload>
    ) => {
      draftState.syncQueueLength = count;
    },
  },
  countSyncQueueFailure: {
    prepare: (errorMessage: string) => ({ payload: { errorMessage } }),
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
    prepare: (errorMessage: string) => ({ payload: { errorMessage } }),
    reducer: () => {},
  },
  updateIsSyncing: {
    prepare: (isSyncing: boolean) => ({ payload: { isSyncing } }),
    reducer: (
      draftState: SyncSliceStateShape,
      { payload: { isSyncing } }: PayloadAction<UpdateIsSyncingActionPayload>
    ) => {
      draftState.isSyncing = isSyncing;
    },
  },
  authenticate: {
    prepare: (loginUrl: string, username: string, password: string) => ({
      payload: { loginUrl, username, password },
    }),
    reducer: () => {},
  },
  authenticateSuccess: () => {},
  authenticateFailure: {
    reducer: () => {},
    prepare: (errorMessage: string) => ({ payload: { errorMessage } }),
  },
  syncSensors: {
    prepare: (sensorUrl: string) => ({ payload: { sensorUrl } }),
    reducer: () => {},
  },
  syncSensorsSuccess: {
    prepare: (numberSent: number): PrepareActionReturn<SyncSuccessPayload> => ({
      payload: { numberSent },
    }),
    reducer: () => {},
  },
  syncSensorsFailure: {
    prepare: (errorMessage: string) => ({ payload: { errorMessage } }),
    reducer: () => {},
  },
  syncTemperatureLogs: {
    prepare: (temperatureLogUrl: string) => ({
      payload: { temperatureLogUrl },
    }),
    reducer: () => {},
  },
  syncTemperatureLogsSuccess: {
    prepare: (numberSent: number): PrepareActionReturn<SyncSuccessPayload> => ({
      payload: { numberSent },
    }),
    reducer: () => {},
  },
  syncTemperatureLogsFailure: {
    prepare: (errorMessage: string) => ({ payload: { errorMessage } }),
    reducer: () => {},
  },
  syncTemperatureBreaches: {
    prepare: (temperatureBreachUrl: string) => ({ payload: { temperatureBreachUrl } }),
    reducer: () => {},
  },
  syncTemperatureBreachesSuccess: {
    prepare: (numberSent: number): PrepareActionReturn<SyncSuccessPayload> => ({
      payload: { numberSent },
    }),
    reducer: () => {},
  },
  syncTemperatureBreachesFailure: {
    prepare: (errorMessage: string) => ({ payload: { errorMessage } }),
    reducer: () => {},
  },
  syncAll: {
    prepare: (syncSettings: SyncAllPayload) => ({ payload: syncSettings }),
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

const SyncSelector = {
  getSliceState: ({ sync }: RootState): SyncSliceStateShape => {
    return sync;
  },
  getSyncQueueCount: (state: RootState): number => {
    const { syncQueueLength } = SyncSelector.getSliceState(state);
    return syncQueueLength;
  },
};

function* authenticate({
  payload: { loginUrl, username, password },
}: PayloadAction<AuthenticateActionPayload>): SagaIterator {
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');

  try {
    yield call(syncOutManager.login, loginUrl, username, password);
    yield put(SyncAction.authenticateSuccess());
  } catch (e) {
    yield put(SyncAction.authenticateFailure(e.message));
  }
}

function* syncSensorsSuccess(): SagaIterator {
  const utils: UtilService = yield call(getDependency, 'utilService');

  try {
    yield put(SettingAction.update('lastSync', utils.now()));
  } catch (e) {
    yield put(SyncAction.syncSensorsFailure(e.message));
  }
}

function* syncSensors({
  payload: { sensorUrl },
}: PayloadAction<SyncSensorsActionPayload>): SagaIterator {
  const syncQueueManager: SyncQueueManager = yield call(getDependency, 'syncQueueManager');
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');

  try {
    const totalRecordsToSend: number = yield call(syncQueueManager.lengthSensors);
    let iter = totalRecordsToSend;

    do {
      const syncLogs: Sensor[] = yield call(syncQueueManager.nextSensors);
      yield call(syncOutManager.syncSensors, sensorUrl, syncLogs);
      yield call(syncQueueManager.dropLogs, syncLogs);
      iter -= syncLogs.length;
    } while (iter > 0);
    yield put(SyncAction.syncSensorsSuccess(totalRecordsToSend));
  } catch (e) {
    yield put(SyncAction.syncSensorsFailure(e.message));
  }
}

function* syncTemperatureLogsSuccess(): SagaIterator {
  const utils: UtilService = yield call(getDependency, 'utilService');

  try {
    yield put(SettingAction.update('lastSync', utils.now()));
  } catch (e) {
    yield put(SyncAction.syncTemperatureLogsFailure(e.message));
  }
}

function* syncTemperatureLogs({
  payload: { temperatureLogUrl },
}: PayloadAction<SyncTemperatureLogsActionPayload>): SagaIterator {
  const syncQueueManager: SyncQueueManager = yield call(getDependency, 'syncQueueManager');
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');

  try {
    const totalRecordsToSend: number = yield call(syncQueueManager.lengthTemperatureLogs);
    let iter = totalRecordsToSend;

    do {
      const syncLogs: TemperatureLog[] = yield call(syncQueueManager.nextTemperatureLogs);
      yield call(syncOutManager.syncTemperatureLogs, temperatureLogUrl, syncLogs);
      yield call(syncQueueManager.dropLogs, syncLogs);
      iter -= syncLogs.length;
    } while (iter > 0);
    yield put(SyncAction.syncTemperatureLogsSuccess(totalRecordsToSend));
  } catch (e) {
    yield put(SyncAction.syncTemperatureLogsFailure(e.message));
  }
}

function* syncTemperatureBreachesSuccess(): SagaIterator {
  const utils: UtilService = yield call(getDependency, 'utilService');

  try {
    yield put(SettingAction.update('lastSync', utils.now()));
  } catch (error) {
    yield put(SyncAction.syncTemperatureBreachesFailure(error.message));
  }
}

function* syncTemperatureBreaches({
  payload: { temperatureBreachUrl },
}: PayloadAction<SyncTemperatureBreachesActionPayload>): SagaIterator {
  const syncQueueManager: SyncQueueManager = yield call(getDependency, 'syncQueueManager');
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');

  try {
    const totalRecordsToSend: number = yield call(syncQueueManager.lengthTemperatureBreaches);
    let iter = totalRecordsToSend;

    do {
      const syncLogs: TemperatureBreach[] = yield call(syncQueueManager.nextTemperatureBreaches);
      yield call(syncOutManager.syncTemperatureBreaches, temperatureBreachUrl, syncLogs);
      yield call(syncQueueManager.dropLogs, syncLogs);
      iter -= syncLogs.length;
    } while (iter > 0);
    yield put(SyncAction.syncTemperatureBreachesSuccess(totalRecordsToSend));
  } catch (e) {
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
}: PayloadAction<SyncAllPayload>): SagaIterator {
  yield put(SyncAction.updateIsSyncing(true));
  yield put(SyncAction.authenticate(authUrl, authUsername, authPassword));
  const authenticateResult: PayloadAction<null> = yield take([
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
    const settingManager: SettingManager = yield call(getDependency, 'settingManager');
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
  const isIntegrating: boolean = yield call(settingManager.getBool, 'isIntegrating');

  if (isIntegrating) {
    yield put(SyncAction.enablePassiveSync());
  }
}

function* tryTestConnection({
  payload: { loginUrl, username, password },
}: PayloadAction<AuthenticateActionPayload>): SagaIterator {
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');

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
  const syncQueue: SyncQueueManager = yield call(getDependency, 'syncQueueManager');

  try {
    const syncCount: number = yield call(syncQueue.length);
    yield put(SyncAction.countSyncQueueSuccess(syncCount));
  } catch (e) {
    yield put(SyncAction.countSyncQueueFailure(e.message));
  }
}

function* root(): SagaIterator {
  yield takeEvery(SyncAction.tryCountSyncQueue, tryCountSyncQueue);

  yield takeLeading(SyncAction.authenticate, authenticate);

  yield takeLeading(SyncAction.syncAll, syncAll);
  yield takeLeading(SyncAction.syncSensors, syncSensors);
  yield takeLeading(SyncAction.syncTemperatureLogs, syncTemperatureLogs);
  yield takeLeading(SyncAction.syncTemperatureBreaches, syncTemperatureBreaches);

  yield takeLeading(SyncAction.syncSensorsSuccess, syncSensorsSuccess);
  yield takeLeading(SyncAction.syncTemperatureLogsSuccess, syncTemperatureLogsSuccess);
  yield takeLeading(SyncAction.syncTemperatureBreachesSuccess, syncTemperatureBreachesSuccess);

  yield takeLeading(SyncAction.tryTestConnection, tryTestConnection);
  yield takeLeading(SyncAction.testConnectionSuccess, testConnectionSuccess);
  yield takeLeading(SyncAction.testConnectionFailure, testConnectionFailure);

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
  startSyncScheduler,
};

export { SyncAction, SyncReducer, SyncSaga, SyncSelector, initialState };
