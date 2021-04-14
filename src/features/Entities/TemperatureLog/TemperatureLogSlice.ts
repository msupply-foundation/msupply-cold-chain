import { SagaIterator } from '@redux-saga/types';
import { createSlice } from '@reduxjs/toolkit';
import { getContext, call, takeEvery } from 'redux-saga/effects';

import { REDUCER, DEPENDENCY } from '../../../common/constants';

export interface TemperatureLogState { }

export interface CreatePayload {
    sensorId: string | null;
    logInterval: number;
    temperature: number;
    timestamp: number;
}

export interface CreateAction {
    type: string;
    payload: CreatePayload;
}

export interface PrepareActionReturn<SomePayload> {
    payload: SomePayload;
}

const TemperatureLogInitialState: TemperatureLogState = {};

const reducers = {
    create: {
        prepare: (sensorId: string | null, logInterval: number, temperature: number, timestamp: number): PrepareActionReturn<CreatePayload> => ({ payload: { sensorId, logInterval, temperature, timestamp } }),
        reducer: () => { },
    },
};

const { actions: TemperatureLogAction, reducer: TemperatureLogReducer } = createSlice({
    name: REDUCER.SENSOR,
    initialState: TemperatureLogInitialState,
    reducers,
});

function* create({
    payload: { sensorId, logInterval, temperature, timestamp },
}: CreateAction): SagaIterator {
    const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
    const TemperatureLogManager = yield call(DependencyLocator.get, DEPENDENCY.TEMPERATURE_LOG_MANAGER);
    try {
        yield call(TemperatureLogManager.addNewTemperatureLog, sensorId, logInterval, temperature, timestamp);
    } catch (error) {
        // TODO: add error handling actions.
        console.log(error.message);
    }
}

function* root(): SagaIterator {
    yield takeEvery(TemperatureLogAction.create, create);
}

const TemperatureLogSelector = {}

const TemperatureLogSaga = {
    root,
    create,
};

export { TemperatureLogSaga, TemperatureLogSelector, TemperatureLogReducer, TemperatureLogAction, TemperatureLogInitialState };
