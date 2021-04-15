import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SagaIterator } from "@redux-saga/types";
import { getContext, call, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '../../common/constants';
import { RootState } from "../../common/store/store";

interface SyncSliceState {
    url: string;
    username: string;
    password: string;
}

const initialState: SyncSliceState = {
    url: '',
    username: '',
    password: '',
};

export interface UpdateHostnameActionPayload {
    url: string,
}

export interface UpdateUrlAction {
    type: string;
    payload: UpdateHostnameActionPayload;
  }

export interface UpdateUsernameActionPayload {
    username: string,
}

export interface UpdateUsernameAction {
    type: string;
    payload: UpdateUsernameActionPayload;
  }

export interface UpdatePasswordActionPayload {
    password: string,
}

export interface UpdatePasswordAction {
    type: string;
    payload: UpdatePasswordActionPayload;
  }

export interface PrepareActionReturn<SomePayload> {
    payload: SomePayload;
}

const reducers = {
    updateUrl: {
        prepare: (url: string): PrepareActionReturn<UpdateHostnameActionPayload> => ({
            payload: { url },
        }),
        reducer: (
            draftState: SyncSliceState,
            { payload: { url } }: PayloadAction<UpdateHostnameActionPayload>
        ) => {
            draftState.url = url;
        }
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
        }
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
        }
    },
    syncAll: () => { }
};

const { actions: SyncAction, reducer: SyncReducer } = createSlice({
    initialState,
    reducers,
    name: REDUCER.SYNC
});

const getSliceState = ({ sync }: RootState): SyncSliceState => {
    return sync;
};

const getUrl = (state: RootState): string => {
    const { url } = getSliceState(state);
    return url;
};

const getUsername = (state: RootState): string => {
    const { username } = getSliceState(state);
    return username;
}

const getPassword = (state: RootState): string => {
    const { password } = getSliceState(state);
    return password;
}

const SyncSelector = {
    getUrl,
    getUsername,
    getPassword
};

function* updateUrl({ payload: { url }}: UpdateUrlAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setUrl(url);
}

function* updateUsername({ payload: { username }}: UpdateUsernameAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setUsername(username);
}


function* updatePassword({ payload: { password }}: UpdatePasswordAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    syncOutManager.setPassword(password);
}


function* syncAll(): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const syncQueueManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_QUEUE_MANAGER);
    const syncOutManager = yield call(DependencyLocator.get, DEPENDENCY.SYNC_OUT_MANAGER);
    try {
        // TODO: add logic for removing successfully pushed logs.
        const syncLogs = yield call(syncQueueManager.peekAll);
        yield call(syncOutManager.pushLogs(syncLogs));
    } catch (error) {
        // TODO: add logic for handling failed pushes
        // eslint-disable-next-line no-console
        console.log(error.message)
    }
}

function* root(): SagaIterator {
    yield takeEvery(SyncAction.updateUrl, updateUrl);
    yield takeEvery(SyncAction.updateUsername, updateUsername);
    yield takeEvery(SyncAction.updatePassword, updatePassword);
    yield takeEvery(SyncAction.syncAll, syncAll);
}

const SyncSaga = { root, syncAll };

export { SyncAction, SyncReducer, SyncSaga, SyncSelector };