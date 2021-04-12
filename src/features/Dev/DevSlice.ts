import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { takeEvery, getContext, call, put } from 'redux-saga/effects';

import { ConsecutiveBreachAction } from '../Breach';
import { Sensor } from '../../common/services/Database/entities';
import { DEPENDENCY, REDUCER } from '../../common/constants';

interface CreatePayload {
    sensor: Sensor;
  }  

const initialState = {};

const reducers = {
  generateBreachLogs: {
    prepare: (sensor: Sensor) => ({ payload: { sensor } }),
    reducer: () => {}
  }
};

const DevSelector = {};

const { actions: DevAction, reducer: DevReducer } = createSlice({
    name: REDUCER.DEV,
    initialState,
    reducers,
  });
  

function* generateBreachLogs({ payload: { sensor } }: PayloadAction<CreatePayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const devManager = yield call(DependencyLocator.get, DEPENDENCY.DEV_MANAGER);
  try {
    yield call(devManager.generateBreachLogs, sensor);
    yield put(ConsecutiveBreachAction.create(sensor));
  } catch (error) {}
}

function* root() {
  yield takeEvery(DevAction.generateBreachLogs, generateBreachLogs);
}

const DevSaga = {
  root,
  generateBreachLogs
};

export {
  DevReducer,
  DevAction,
  DevSaga,
  DevSelector,
};
