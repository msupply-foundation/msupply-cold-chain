import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { takeEvery, getContext, call, put } from 'redux-saga/effects';

import { Sensor } from '../../common/services/Database/entities';
import { DEPENDENCY, REDUCER } from '../../common/constants';

import { SensorAction } from '../Entities';
import { ConsecutiveBreachAction } from '../Breach'


interface CreatePayload {
    sensor: Sensor;
  }  

const initialState = {};

const reducers = {
  generateSensor: () => {},
  generateTemperatureLog: {
    prepare: (sensor: Sensor) => ({ payload: { sensor } }),
    reducer: () => {}
  },
  generateTemperatureBreach: {
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
  

function* generateSensor(): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const devManager = yield call(DependencyLocator.get, DEPENDENCY.DEV_MANAGER);

  try {
    const sensor = yield call(devManager.generateSensor);
    yield put(SensorAction.create(sensor.macAddress, sensor.logInterval, sensor.logDelay, sensor.batteryLevel));
  } catch (error) {
    // TODO: add error handling actions.
    // eslint-disable-next-line no-console
    console.log(error.message);
  }
}

function* generateTemperatureLog({ payload: { sensor } }: PayloadAction<CreatePayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const devManager = yield call(DependencyLocator.get, DEPENDENCY.DEV_MANAGER);
  const temperatureLogManager = yield call(DependencyLocator.get, DEPENDENCY.TEMPERATURE_LOG_MANAGER);
  try {
    const temperatureLog = yield call(devManager.generateTemperatureLog, sensor);
    yield call(temperatureLogManager.addNewTemperatureLog, temperatureLog);
  } catch (error) {
    // TODO: add error handling actions.
    // eslint-disable-next-line no-console
    console.log(error.message);
  }
}
 
function* generateTemperatureBreach({ payload: { sensor } }: PayloadAction<CreatePayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const devManager = yield call(DependencyLocator.get, DEPENDENCY.DEV_MANAGER);
  const temperatureLogManager = yield call(DependencyLocator.get, DEPENDENCY.TEMPERATURE_LOG_MANAGER);
  try {
    const temperatureLogs = yield call(devManager.generateBreachTemperatureLogs, sensor);
    yield call(temperatureLogManager.addNewTemperatureLogs, temperatureLogs);
    yield put(ConsecutiveBreachAction.create(sensor));
  } catch (error) {
      // TODO: add error handling actions.
      // eslint-disable-next-line no-console
      console.log(error.message);
  }
}

function* root(): SagaIterator {
  yield takeEvery(DevAction.generateSensor, generateSensor);
  yield takeEvery(DevAction.generateTemperatureLog, generateTemperatureLog);
  yield takeEvery(DevAction.generateTemperatureBreach, generateTemperatureBreach);
}

const DevSaga = {
  root,
  generateSensor,
  generateTemperatureLog,
  generateTemperatureBreach,
};

export {
  DevReducer,
  DevAction,
  DevSaga,
  DevSelector,
};
