import { createSlice } from "@reduxjs/toolkit";
import { SagaIterator } from "@redux-saga/types";
import { getContext, call, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '../../common/constants';

interface SyncQueueSliceState { };

const initialState: SyncQueueSliceState = {};

const reducers = {
    syncAll: () => { }
};

const { actions: SyncAction, reducer: SyncReducer } = createSlice({
    initialState,
    reducers,
    name: REDUCER.SYNC
});

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
        console.log(error.message)
    }
}

function* root(): SagaIterator {
    yield takeEvery(SyncAction.syncAll, syncAll);
}

const SyncSaga = { root, syncAll };

const SyncSelector = {};

export { SyncAction, SyncReducer, SyncSaga, SyncSelector };