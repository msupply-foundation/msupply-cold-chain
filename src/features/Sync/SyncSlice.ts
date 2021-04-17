import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '../../common/constants';
import { RootState } from '../../common/store/store';
import { SyncLog } from '../../common/services/Database/entities';

interface SyncSliceState {
    host: string;
    port: string;
    loginPath: string;
    sensorPath: string;
    temperatureLogPath: string;
    temperatureBreachPath: string;
    username: string;
    password: string;
}

const initialState: SyncSliceState = {
    host: '',
    port: '',
    loginPath: '',
    sensorPath: '',
    temperatureLogPath: '',
    temperatureBreachPath: '',
    username: '',
    password: '',
};

export interface UpdateHostActionPayload {
    host: string;
}

export interface UpdateHostAction {
    type: string;
    payload: UpdateHostActionPayload;
}

export interface UpdatePortActionPayload {
    port: string;
}
export interface UpdatePortAction {
    type: string;
    payload: UpdatePortActionPayload;
}

export interface UpdateLoginPathActionPayload {
    loginPath: string;
}
export interface UpdateLoginPathAction {
    type: string;
    payload: UpdateLoginPathActionPayload;
}

export interface UpdateSensorPathActionPayload {
    sensorPath: string;
}
export interface UpdateSensorPathAction {
    type: string;
    payload: UpdateSensorPathActionPayload;
}

export interface UpdateTemperatureLogPathActionPayload {
    temperatureLogPath: string;
}
export interface UpdateTemperatureLogPathAction {
    type: string;
    payload: UpdateTemperatureLogPathActionPayload;
}

export interface UpdateTemperatureBreachPathActionPayload {
    temperatureBreachPath: string;
}
export interface UpdateTemperatureBreachPathAction {
    type: string;
    payload: UpdateTemperatureBreachPathActionPayload;
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
    host: string;
    port: string;
    loginPath: string;
    sensorPath: string;
    temperatureLogPath: string;
    temperatureBreachPath: string;
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
    updateHost: {
        prepare: (host: string): PrepareActionReturn<UpdateHostActionPayload> => ({
            payload: { host },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { host } }: PayloadAction<UpdateHostActionPayload>
        ) => {
            draftState.host = host;
        },
    },
    updatePort: {
        prepare: (port: string): PrepareActionReturn<UpdatePortActionPayload> => ({
            payload: { port },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { port } }: PayloadAction<UpdatePortActionPayload>
        ) => {
            draftState.port = port;
        },
    },
    updateLoginPath: {
        prepare: (loginPath: string): PrepareActionReturn<UpdateLoginPathActionPayload> => ({
            payload: { loginPath },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { loginPath } }: PayloadAction<UpdateLoginPathActionPayload>
        ) => {
            draftState.loginPath = loginPath;
        },
    },
    updateSensorPath: {
        prepare: (sensorPath: string): PrepareActionReturn<UpdateSensorPathActionPayload> => ({
            payload: { sensorPath },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { sensorPath } }: PayloadAction<UpdateSensorPathActionPayload>
        ) => {
            draftState.sensorPath = sensorPath;
        },
    },
    updateTemperatureLogPath: {
        prepare: (
            temperatureLogPath: string
        ): PrepareActionReturn<UpdateTemperatureLogPathActionPayload> => ({
            payload: { temperatureLogPath },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { temperatureLogPath } }: PayloadAction<UpdateTemperatureLogPathActionPayload>
        ) => {
            draftState.temperatureLogPath = temperatureLogPath;
        },
    },
    updateTemperatureBreachPath: {
        prepare: (
            temperatureBreachPath: string
        ): PrepareActionReturn<UpdateTemperatureBreachPathActionPayload> => ({
            payload: { temperatureBreachPath },
        }),
        reducer: (
            draftState: SyncSliceState,
            {
                payload: { temperatureBreachPath },
            }: PayloadAction<UpdateTemperatureBreachPathActionPayload>
        ) => {
            draftState.temperatureBreachPath = temperatureBreachPath;
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
            host,
            port,
            loginPath,
            sensorPath,
            temperatureLogPath,
            temperatureBreachPath,
            username,
            password,
        }: {
            host: string;
            port: string;
            loginPath: string;
            sensorPath: string;
            temperatureLogPath: string;
            temperatureBreachPath: string;
            username: string;
            password: string;
        }): PrepareActionReturn<FetchAllSuccessActionPayload> => ({
            payload: {
                host,
                port,
                loginPath,
                sensorPath,
                temperatureLogPath,
                temperatureBreachPath,
                username,
                password,
            },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { host, port, loginPath, sensorPath, temperatureLogPath, temperatureBreachPath, username, password } }: PayloadAction<FetchAllSuccessActionPayload>
        ) => {
            draftState.host = host;
            draftState.port = port;
            draftState.loginPath = loginPath;
            draftState.sensorPath = sensorPath;
            draftState.temperatureLogPath = temperatureLogPath;
            draftState.temperatureBreachPath = temperatureBreachPath;
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

const getHost = (state: RootState): string => {
    const { host } = getSliceState(state);
    return host;
};

const getPort = (state: RootState): string => {
    const { port } = getSliceState(state);
    return port;
};

const getLoginPath = (state: RootState): string => {
    const { loginPath } = getSliceState(state);
    return loginPath;
};

const getSensorPath = (state: RootState): string => {
    const { sensorPath } = getSliceState(state);
    return sensorPath;
};

const getTemperatureLogPath = (state: RootState): string => {
    const { temperatureLogPath } = getSliceState(state);
    return temperatureLogPath;
};

const getTemperatureBreachPath = (state: RootState): string => {
    const { temperatureBreachPath } = getSliceState(state);
    return temperatureBreachPath;
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
    getHost,
    getPort,
    getLoginPath,
    getSensorPath,
    getTemperatureLogPath,
    getTemperatureBreachPath,
    getUsername,
    getPassword,
};

function* updateHost({ payload: { host } }: UpdateHostAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setHost(host);
}

function* updatePort({ payload: { port } }: UpdatePortAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setPort(port);
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

function* syncSensorsSuccess(): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
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
            host,
            port,
            loginPath,
            sensorPath,
            temperatureLogPath,
            temperatureBreachPath,
            username,
            password,
        } = syncOutManager;

        yield put(
            SyncAction.fetchAllSuccess({
                host,
                port,
                loginPath,
                sensorPath,
                temperatureLogPath,
                temperatureBreachPath,
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
    yield takeEvery(SyncAction.updateHost, updateHost);
    yield takeEvery(SyncAction.updatePort, updatePort);
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