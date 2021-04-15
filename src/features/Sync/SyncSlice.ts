import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '../../common/constants';
import { RootState } from '../../common/store/store';

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
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    yield call(syncQueueManager.dropSensors);
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
        yield call(syncSensorsSuccess);
    } catch (e) {
        yield call(syncSensorsFailure);
    }
}

function* syncTemperatureLogsSuccess(): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    yield call(syncQueueManager.dropTemperatureLogs);
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
        yield call(syncTemperatureLogsSuccess);
    } catch (e) {
        yield call(syncTemperatureLogsFailure);
    }
}

function* syncTemperatureBreachesSuccess(): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    yield call(syncQueueManager.dropTemperatureBreaches);
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
        yield call(syncTemperatureBreachesSuccess);
    } catch (e) {
        yield call(syncTemperatureBreachesFailure);
    }
}

function* syncAll(): SagaIterator {
    yield call(syncSensors);
    yield call(syncTemperatureLogs);
    yield call(syncTemperatureBreaches);
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
    yield takeEvery(SyncAction.fetchAll, fetchAll);
    yield takeEvery(SyncAction.syncAll, syncAll);
}

const SyncSaga = { root, fetchAll, syncAll };

export { SyncAction, SyncReducer, SyncSaga, SyncSelector };
