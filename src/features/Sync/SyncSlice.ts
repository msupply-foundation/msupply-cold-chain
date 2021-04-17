import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '../../common/constants';
import { RootState } from '../../common/store/store';
import { SyncLog } from '../../common/services/Database/entities';

interface SyncSliceState {
    loginUrl: string;
    sensorUrl: string;
    temperatureLogUrl: string;
    temperatureBreachUrl: string;
    username: string;
    password: string;
}

const initialState: SyncSliceState = {
    loginUrl: '',
    sensorUrl: '',
    temperatureLogUrl: '',
    temperatureBreachUrl: '',
    username: '',
    password: '',
};

export interface UpdateLoginUrlActionPayload {
    loginUrl: string;
}
export interface UpdateLoginUrlAction {
    type: string;
    payload: UpdateLoginUrlActionPayload;
}

export interface UpdateSensorUrlActionPayload {
    sensorUrl: string;
}
export interface UpdateSensorUrlAction {
    type: string;
    payload: UpdateSensorUrlActionPayload;
}

export interface UpdateTemperatureLogUrlActionPayload {
    temperatureLogUrl: string;
}
export interface UpdateTemperatureLogUrlAction {
    type: string;
    payload: UpdateTemperatureLogUrlActionPayload;
}

export interface UpdateTemperatureBreachUrlActionPayload {
    temperatureBreachUrl: string;
}
export interface UpdateTemperatureBreachUrlAction {
    type: string;
    payload: UpdateTemperatureBreachUrlActionPayload;
}

export interface UpdateUsernameActionPayload {
    username: string;
}
export interface UpdateUsernameAction {
    type: string;
    payload: UpdateUsernameActionPayload;
}

export interface UpdatePasswordActionPayload {
    password: string;
}

export interface UpdatePasswordAction {
    type: string;
    payload: UpdatePasswordActionPayload;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AuthenticateSuccessActionPayload {}

export interface AuthenticateSuccessAction {
    type: string;
    payload: AuthenticateSuccessActionPayload;
}

export interface SyncSensorsSuccessActionPayload {
    syncLogs: SyncLog[]
}

export interface SyncSensorsSuccessAction {
    type: string;
    payload: SyncSensorsSuccessActionPayload;
}

export interface SyncTemperatureLogsSuccessActionPayload {
    syncLogs: SyncLog[]
}

export interface SyncTemperatureLogsSuccessAction {
    type: string;
    payload: SyncTemperatureLogsSuccessActionPayload;
}

export interface  SyncTemperatureBreachesSuccessActionPayload {
    syncLogs: SyncLog[]
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
}

export interface FetchAllAction {
    type: string;
    payload: FetchAllSuccessActionPayload;
}
export interface PrepareActionReturn<SomePayload> {
    payload: SomePayload;
}

const reducers = {
    updateLoginUrl: {
        prepare: (loginUrl: string): PrepareActionReturn<UpdateLoginUrlActionPayload> => ({
            payload: { loginUrl },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { loginUrl } }: PayloadAction<UpdateLoginUrlActionPayload>
        ) => {
            draftState.loginUrl = loginUrl;
        },
    },
    updateSensorUrl: {
        prepare: (sensorUrl: string): PrepareActionReturn<UpdateSensorUrlActionPayload> => ({
            payload: { sensorUrl },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { sensorUrl } }: PayloadAction<UpdateSensorUrlActionPayload>
        ) => {
            draftState.sensorUrl = sensorUrl;
        },
    },
    updateTemperatureLogUrl: {
        prepare: (
            temperatureLogUrl: string
        ): PrepareActionReturn<UpdateTemperatureLogUrlActionPayload> => ({
            payload: { temperatureLogUrl },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { temperatureLogUrl } }: PayloadAction<UpdateTemperatureLogUrlActionPayload>
        ) => {
            draftState.temperatureLogUrl = temperatureLogUrl;
        },
    },
    updateTemperatureBreachUrl: {
        prepare: (
            temperatureBreachUrl: string
        ): PrepareActionReturn<UpdateTemperatureBreachUrlActionPayload> => ({
            payload: { temperatureBreachUrl },
        }),
        reducer: (
            draftState: SyncSliceState,
            {
                payload: { temperatureBreachUrl },
            }: PayloadAction<UpdateTemperatureBreachUrlActionPayload>
        ) => {
            draftState.temperatureBreachUrl = temperatureBreachUrl;
        },
    },
    updateUsername: {
        prepare: (username: string): PrepareActionReturn<UpdateUsernameActionPayload> => ({
            payload: { username },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { username } }: PayloadAction<UpdateUsernameActionPayload>
        ) => {
            draftState.username = username;
        },
    },
    updatePassword: {
        prepare: (password: string): PrepareActionReturn<UpdatePasswordActionPayload> => ({
            payload: { password },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { password } }: PayloadAction<UpdatePasswordActionPayload>
        ) => {
            draftState.password = password;
        },
    },
    authenticate: () => {},
    authenticateSuccess: () => {},
    authenticateFailure: () => {},
    syncSensors: () => {},
    syncSensorsSuccess: {
        prepare: (syncLogs: SyncLog[]):  PrepareActionReturn<SyncSensorsSuccessActionPayload> => ({
            payload: { syncLogs },
        }),
        reducer: () => {}
    },
    syncSensorsFailure: () => {},
    syncTemperatureLogs: () => {},
    syncTemperatureLogsSuccess: {
        prepare: (syncLogs: SyncLog[]):  PrepareActionReturn<SyncTemperatureLogsSuccessActionPayload> => ({
            payload: { syncLogs },
        }),
        reducer: () => {}
    },
    syncTemperatureLogsFailure: () => {},
    syncTemperatureBreaches: () => {},
    syncTemperatureBreachesSuccess: {
        prepare: (syncLogs: SyncLog[]):  PrepareActionReturn<SyncTemperatureBreachesSuccessActionPayload> => ({
            payload: { syncLogs },
        }),
        reducer: () => {}
    },
    syncTemperatureBreachesFailure: () => {},
    fetchAll: () => { },
    fetchAllSuccess: {
        prepare: ({
            loginUrl,
            sensorUrl,
            temperatureLogUrl,
            temperatureBreachUrl,
            username,
            password,
        }: {
            loginUrl: string;
            sensorUrl: string;
            temperatureLogUrl: string;
            temperatureBreachUrl: string;
            username: string;
            password: string;
        }): PrepareActionReturn<FetchAllSuccessActionPayload> => ({
            payload: {
                loginUrl,
                sensorUrl,
                temperatureLogUrl,
                temperatureBreachUrl,
                username,
                password,
            },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { loginUrl, sensorUrl, temperatureLogUrl, temperatureBreachUrl, username, password } }: PayloadAction<FetchAllSuccessActionPayload>
        ) => {
            draftState.loginUrl = loginUrl;
            draftState.sensorUrl = sensorUrl;
            draftState.temperatureLogUrl = temperatureLogUrl;
            draftState.temperatureBreachUrl = temperatureBreachUrl;
            draftState.username = username;
            draftState.password = password;
        },
    },
    syncAll: () => { },
};

const { actions: SyncAction, reducer: SyncReducer } = createSlice({
    initialState,
    reducers,
    name: REDUCER.SYNC,
});

const getSliceState = ({ sync }: RootState): SyncSliceState => {
    return sync;
};

const getLoginUrl = (state: RootState): string => {
    const { loginUrl } = getSliceState(state);
    return loginUrl;
};

const getSensorUrl = (state: RootState): string => {
    const { sensorUrl } = getSliceState(state);
    return sensorUrl;
};

const getTemperatureLogUrl = (state: RootState): string => {
    const { temperatureLogUrl } = getSliceState(state);
    return temperatureLogUrl;
};

const getTemperatureBreachUrl = (state: RootState): string => {
    const { temperatureBreachUrl } = getSliceState(state);
    return temperatureBreachUrl;
};

const getUsername = (state: RootState): string => {
    const { username } = getSliceState(state);
    return username;
};

const getPassword = (state: RootState): string => {
    const { password } = getSliceState(state);
    return password;
};

const SyncSelector = {
    getLoginUrl,
    getSensorUrl,
    getTemperatureLogUrl,
    getTemperatureBreachUrl,
    getUsername,
    getPassword,
};

function* updateLoginUrl({ payload: { loginUrl } }: UpdateLoginUrlAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setLoginUrl(loginUrl);
}

function* updateSensorUrl({ payload: { sensorUrl } }: UpdateSensorUrlAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setSensorUrl(sensorUrl);
}

function* updateTemperatureLogUrl({ payload: { temperatureLogUrl } }: UpdateTemperatureLogUrlAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setTemperatureLogUrl(temperatureLogUrl);
}

function* updateTemperatureBreachUrl({ payload: { temperatureBreachUrl } }: UpdateTemperatureBreachUrlAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setTemperatureBreachUrl(temperatureBreachUrl);
}

function* updateUsername({ payload: { username } }: UpdateUsernameAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setUsername(username);
}

function* updatePassword({ payload: { password } }: UpdatePasswordAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setPassword(password);
}

function* authenticateSuccess(): SagaIterator {
    // TODO.
}

function* authenticateFailure(): SagaIterator { 
    // TODO.
}

function* authenticate(): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);

    try {
        yield call(syncOutManager.login);
        yield put(SyncAction.authenticateSuccess());
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e.message);
        yield put(SyncAction.authenticateFailure())
    }
}

function* syncSensorsSuccess({ payload: { syncLogs } }: SyncSensorsSuccessAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    yield call(syncQueueManager.dropLogs, syncLogs);
}

function* syncSensorsFailure(): SagaIterator {
    // TODO.
}

function* syncSensors(): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);

    try {
        const syncLogs = yield call(syncQueueManager.nextSensors);
        yield call(syncOutManager.syncSensors, syncLogs);
        yield put(SyncAction.syncSensorsSuccess(syncLogs));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e.message);
        yield call(syncSensorsFailure);
    }
}

function* syncTemperatureLogsSuccess({ payload: { syncLogs } }: SyncTemperatureLogsSuccessAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    yield call(syncQueueManager.dropLogs, syncLogs);
}

function* syncTemperatureLogsFailure(): SagaIterator {
    // TODO.
}

function* syncTemperatureLogs(): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);

    try {
        const syncLogs = yield call(syncQueueManager.nextTemperatureLogs);
        yield call(syncOutManager.syncTemperatureLogs, syncLogs);
        yield put(SyncAction.syncTemperatureLogsSuccess(syncLogs));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e.message);
        yield call(syncTemperatureLogsFailure);
    }
}

function* syncTemperatureBreachesSuccess({ payload: { syncLogs } }: SyncTemperatureBreachesSuccessAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    yield call(syncQueueManager.dropLogs, syncLogs);
}

function* syncTemperatureBreachesFailure(): SagaIterator {
    // TODO.
}

function* syncTemperatureBreaches(): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);

    try {
        const syncLogs = yield call(syncQueueManager.nextTemperatureBreaches);
        yield call(syncOutManager.syncTemperatureBreaches, syncLogs);
        yield put(SyncAction.syncTemperatureBreachesSuccess(syncLogs));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e.message);
        yield put(SyncAction.syncTemperatureBreachesFailure());
    }
}

function* syncAll(): SagaIterator {
    yield put(SyncAction.syncSensors());
    yield put(SyncAction.syncTemperatureLogs());
    yield put(SyncAction.syncTemperatureBreaches());
}

function* fetchAll(): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    try {
        const {
            loginUrl,
            sensorUrl,
            temperatureLogUrl,
            temperatureBreachUrl,
            username,
            password,
        } = syncOutManager;

        yield put(
            SyncAction.fetchAllSuccess({
                loginUrl,
                sensorUrl,
                temperatureLogUrl,
                temperatureBreachUrl,
                username,
                password,
            })
        );
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error.message);
        // TODO: add logic for handling failed pushes
    }
}

function* root(): SagaIterator {
    yield takeEvery(SyncAction.updateLoginUrl, updateLoginUrl);
    yield takeEvery(SyncAction.updateSensorUrl, updateSensorUrl);
    yield takeEvery(SyncAction.updateTemperatureLogUrl, updateTemperatureLogUrl);
    yield takeEvery(SyncAction.updateTemperatureBreachUrl, updateTemperatureBreachUrl);
    yield takeEvery(SyncAction.updateUsername, updateUsername);
    yield takeEvery(SyncAction.updatePassword, updatePassword);
    yield takeEvery(SyncAction.authenticate, authenticate)
    yield takeEvery(SyncAction.authenticateSuccess, authenticateSuccess);
    yield takeEvery(SyncAction.authenticateFailure, authenticateFailure);
    yield takeEvery(SyncAction.syncSensors, syncSensors);
    yield takeEvery(SyncAction.syncSensorsSuccess, syncSensorsSuccess);
    yield takeEvery(SyncAction.syncSensorsFailure, syncSensorsFailure);
    yield takeEvery(SyncAction.syncTemperatureLogs, syncTemperatureLogs);
    yield takeEvery(SyncAction.syncTemperatureLogsSuccess, syncTemperatureLogsSuccess);
    yield takeEvery(SyncAction.syncTemperatureLogsFailure, syncTemperatureLogsFailure);
    yield takeEvery(SyncAction.syncTemperatureBreaches, syncTemperatureBreaches);
    yield takeEvery(SyncAction.syncTemperatureBreachesSuccess, syncTemperatureBreachesSuccess);
    yield takeEvery(SyncAction.syncTemperatureBreachesFailure, syncTemperatureBreachesFailure);
    yield takeEvery(SyncAction.fetchAll, fetchAll);
    yield takeEvery(SyncAction.syncAll, syncAll);
}

const SyncSaga = { root, fetchAll, syncAll };

export { SyncAction, SyncReducer, SyncSaga, SyncSelector };