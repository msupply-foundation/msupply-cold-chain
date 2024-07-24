import { ToastAndroid } from 'react-native';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import { call, put, takeEvery, takeLeading, take, race } from 'redux-saga/effects';

import { UtilService } from '~services/UtilService';
import { TemperatureLog, TemperatureBreach, Sensor } from '~services/Database/entities';
import { SettingAction, SettingManager, SyncSettingMap } from '~features/Entities/Setting';
import { DEPENDENCY, REDUCER } from '~constants';
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
  SyncSuccessPayload,
  UpdateSyncErrorActionPayload,
} from './types';
import { FailurePayload, PrepareActionReturn } from '~common/types/common';
import Bugsnag from '@bugsnag/react-native';

export const ENDPOINT = {
  LOGIN: 'coldchain/v1/login',
  SENSOR: 'coldchain/v1/sensor',
  TEMPERATURE_LOG: 'coldchain/v1/temperature-log',
  TEMPERATURE_BREACH: 'coldchain/v1/temperature-breach',
};

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
  tryIntegrating: () => {},
  tryTestConnection: {
    prepare: (
      serverUrl: string,
      username: string,
      password: string
    ): PrepareActionReturn<AuthenticateActionPayload> => ({
      payload: { username, password, serverUrl },
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
  updateSyncError: {
    prepare: (syncError: string) => ({ payload: { syncError } }),
    reducer: (
      draftState: SyncSliceStateShape,
      { payload: { syncError } }: PayloadAction<UpdateSyncErrorActionPayload>
    ) => {
      draftState.syncError = syncError;
    },
  },
  authenticate: {
    prepare: (serverUrl: string, username: string, password: string) => ({
      payload: { serverUrl, username, password },
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
  getIsSyncing: (state: RootState): boolean => {
    const { isSyncing } = SyncSelector.getSliceState(state);
    return isSyncing;
  },
  getSyncError: (state: RootState): string | undefined => {
    const { syncError } = SyncSelector.getSliceState(state);
    return syncError;
  },
};

function* authenticate({
  payload: { serverUrl, username, password },
}: PayloadAction<AuthenticateActionPayload>): SagaIterator {
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');

  try {
    const loginUrl = `${serverUrl}/${ENDPOINT.LOGIN}`;
    yield call(syncOutManager.login, loginUrl, username, password);
    yield put(SyncAction.authenticateSuccess());
  } catch (e) {
    yield put(SyncAction.authenticateFailure((e as Error).message));
  }
}

function* syncSensorsFailure(): SagaIterator {
  yield put(SyncAction.updateSyncError('Failed to sync sensors'));
}

function* syncSensors({
  payload: { sensorUrl },
}: PayloadAction<SyncSensorsActionPayload>): SagaIterator {
  const syncQueueManager: SyncQueueManager = yield call(getDependency, 'syncQueueManager');
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');

  try {
    const totalRecordsToSend: number = yield call(syncQueueManager.lengthSensors);
    let iter = totalRecordsToSend;

    while (iter > 0) {
      const syncLogs: Sensor[] = yield call(syncQueueManager.nextSensors);
      yield call(syncOutManager.syncSensors, sensorUrl, syncLogs);
      yield call(syncQueueManager.dropLogs, syncLogs);
      iter -= syncLogs.length;
    }
    yield put(SyncAction.syncSensorsSuccess(totalRecordsToSend));
  } catch (e) {
    yield put(SyncAction.syncSensorsFailure((e as Error).message));
  }
}

function* syncTemperatureLogsFailure(): SagaIterator {
  yield put(SyncAction.updateSyncError('Failed to sync temperature logs'));
}

function* syncTemperatureLogs({
  payload: { temperatureLogUrl },
}: PayloadAction<SyncTemperatureLogsActionPayload>): SagaIterator {
  const syncQueueManager: SyncQueueManager = yield call(getDependency, 'syncQueueManager');
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');

  try {
    const totalRecordsToSend: number = yield call(syncQueueManager.lengthTemperatureLogs);
    let iter = totalRecordsToSend;

    while (iter > 0) {
      const syncLogs: TemperatureLog[] = yield call(syncQueueManager.nextTemperatureLogs);
      yield call(syncOutManager.syncTemperatureLogs, temperatureLogUrl, syncLogs);
      yield call(syncQueueManager.dropLogs, syncLogs);
      iter -= syncLogs.length;
    }
    yield put(SyncAction.syncTemperatureLogsSuccess(totalRecordsToSend));
  } catch (e) {
    yield put(SyncAction.syncTemperatureLogsFailure((e as Error).message));
  }
}

function* syncTemperatureBreachesFailure(): SagaIterator {
  yield put(SyncAction.updateSyncError('Failed to sync temperature breaches'));
}

function* syncTemperatureBreaches({
  payload: { temperatureBreachUrl },
}: PayloadAction<SyncTemperatureBreachesActionPayload>): SagaIterator {
  const syncQueueManager: SyncQueueManager = yield call(getDependency, 'syncQueueManager');
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');

  try {
    const totalRecordsToSend: number = yield call(syncQueueManager.lengthTemperatureBreaches);
    let iter = totalRecordsToSend;

    while (iter > 0) {
      const syncLogs: TemperatureBreach[] = yield call(syncQueueManager.nextTemperatureBreaches);
      yield call(syncOutManager.syncTemperatureBreaches, temperatureBreachUrl, syncLogs);
      yield call(syncQueueManager.dropLogs, syncLogs);
      iter -= syncLogs.length;
    }
    yield put(SyncAction.syncTemperatureBreachesSuccess(totalRecordsToSend));
  } catch (e) {
    yield put(SyncAction.syncTemperatureBreachesFailure((e as Error).message));
  }
}

function* syncAll({
  payload: { serverUrl, authUsername, authPassword },
}: PayloadAction<SyncAllPayload>): SagaIterator {
  const utils: UtilService = yield call(getDependency, 'utilService');
  yield put(SettingAction.update('lastSyncStart', utils.now()));
  yield put(SyncAction.updateIsSyncing(true));
  yield put(SyncAction.updateSyncError(''));
  yield put(SyncAction.authenticate(`${serverUrl}/${ENDPOINT.LOGIN}`, authUsername, authPassword));
  const authenticateResult: PayloadAction<null> = yield take([
    SyncAction.authenticateSuccess,
    SyncAction.authenticateFailure,
  ]);
  if (authenticateResult.type === SyncAction.authenticateSuccess.type) {
    try {
      yield put(SyncAction.syncSensors(`${serverUrl}/${ENDPOINT.SENSOR}`));
      yield take([SyncAction.syncSensorsSuccess, SyncAction.syncSensorsFailure]);
      yield put(SyncAction.syncTemperatureBreaches(`${serverUrl}/${ENDPOINT.TEMPERATURE_BREACH}`));
      yield take([
        SyncAction.syncTemperatureBreachesSuccess,
        SyncAction.syncTemperatureBreachesFailure,
      ]);
      yield put(SyncAction.syncTemperatureLogs(`${serverUrl}/${ENDPOINT.TEMPERATURE_LOG}`));
      yield take([SyncAction.syncTemperatureLogsSuccess, SyncAction.syncTemperatureLogsFailure]);
      yield put(SettingAction.update('lastSync', utils.now()));
    } catch (e) {
      console.error('syncAll error', e);
      yield put(SyncAction.updateSyncError((e as Error).message));
      Bugsnag.notify(e as Error);
    }
  } else {
    console.warn('Authentication failed, Skipping sync.');
    yield put(SyncAction.updateSyncError('Authentication failed'));
  }
  yield put(SyncAction.updateIsSyncing(false));
}

function* tryIntegrating(): SagaIterator {
  const settingManager: SettingManager = yield call(getDependency, DEPENDENCY.SETTING_MANAGER);
  const isIntegrating: boolean = yield call(settingManager.getBool, 'isIntegrating');
  const syncQueueManager: SyncQueueManager = yield call(getDependency, 'syncQueueManager');

  if (!isIntegrating || (yield call(syncQueueManager.length)) === 0) return;

  const syncSettings: SyncSettingMap = yield call(settingManager.getSyncSettings);
  yield put(SyncAction.syncAll(syncSettings));
}

function* enablePassiveSync(): SagaIterator {
  yield race({
    start: take(SyncAction.enablePassiveSync),
    stop: take(SyncAction.disablePassiveSync),
  });
}

function* tryTestConnection({
  payload: { serverUrl, username, password },
}: PayloadAction<AuthenticateActionPayload>): SagaIterator {
  const syncOutManager: SyncOutManager = yield call(getDependency, 'syncOutManager');
  ToastAndroid.show('Testing Connection', ToastAndroid.SHORT);
  try {
    const loginUrl = `${serverUrl}/${ENDPOINT.LOGIN}`;
    const loginResponse = yield call(syncOutManager.login, loginUrl, username, password);
    const { success } = loginResponse?.data ?? {};

    if (success !== true) {
      yield put(SyncAction.testConnectionFailure('Invalid response returned from login'));
      return;
    }

    // login returned correctly, now test for a valid response from the sensor endpoint
    const sensorUrl = `${serverUrl}/${ENDPOINT.SENSOR}`;
    const sensorResponse = yield call(syncOutManager.syncSensors, sensorUrl, []);
    const sensors = sensorResponse?.data;
    if (!Array.isArray(sensors) || sensors.length !== 0) {
      yield put(SyncAction.testConnectionFailure('Does not appear to be a cold chain server'));
      return;
    }
    yield put(SyncAction.testConnectionSuccess());
  } catch (e) {
    yield put(SyncAction.testConnectionFailure((e as Error).message));
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
    yield put(SyncAction.countSyncQueueFailure((e as Error).message));
  }
}

function* root(): SagaIterator {
  yield takeEvery(SyncAction.tryCountSyncQueue, tryCountSyncQueue);

  yield takeLeading(SyncAction.authenticate, authenticate);

  yield takeLeading(SyncAction.syncAll, syncAll);
  yield takeLeading(SyncAction.syncSensors, syncSensors);
  yield takeLeading(SyncAction.syncTemperatureLogs, syncTemperatureLogs);
  yield takeLeading(SyncAction.syncTemperatureBreaches, syncTemperatureBreaches);
  yield takeLeading(SyncAction.syncSensorsFailure, syncSensorsFailure);
  yield takeLeading(SyncAction.syncTemperatureLogsFailure, syncTemperatureLogsFailure);
  yield takeLeading(SyncAction.syncTemperatureBreachesFailure, syncTemperatureBreachesFailure);

  yield takeLeading(SyncAction.tryTestConnection, tryTestConnection);
  yield takeLeading(SyncAction.testConnectionSuccess, testConnectionSuccess);
  yield takeLeading(SyncAction.testConnectionFailure, testConnectionFailure);

  yield takeLeading(SyncAction.enablePassiveSync, enablePassiveSync);
  yield takeEvery(SyncAction.tryIntegrating, tryIntegrating);
}

const SyncSaga = {
  root,
  syncAll,
  tryCountSyncQueue,
  authenticate,
  syncSensors,
  syncTemperatureBreaches,
  syncTemperatureLogs,
  syncSensorsFailure,
  syncTemperatureLogsFailure,
  syncTemperatureBreachesFailure,
  tryTestConnection,
  testConnectionFailure,
  testConnectionSuccess,
};

export { SyncAction, SyncReducer, SyncSaga, SyncSelector, initialState };
