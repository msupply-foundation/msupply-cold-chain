import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { takeEvery, getContext, call, put } from 'redux-saga/effects';

import { Sensor } from '../../common/services/Database/entities';
import { DEPENDENCY, REDUCER } from '../../common/constants';

import { SensorAction } from '../Entities';
import { ConsecutiveBreachAction } from '../Breach';
import moment from 'moment';

interface CreatePayload {
  sensor: Sensor;
  min?: number;
  max?: number;
  numLogs?: number;
  skip?: number;
}

const initialState = {};

const reducers = {
  generateSensor: () => {},
  generateTemperatureLog: {
    prepare: (sensor: Sensor) => ({ payload: { sensor } }),
    reducer: () => {},
  },
  generateTemperatureBreach: {
    prepare: (sensor: Sensor) => ({ payload: { sensor } }),
    reducer: () => {},
  },
  generateTemperatureLogs: {
    prepare: (sensor: Sensor, min: number, max: number, numLogs: number) => ({
      payload: { sensor, min, max, numLogs },
    }),
    reducer: () => {},
  },
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
    yield put(
      SensorAction.create(
        sensor.macAddress,
        sensor.logInterval,
        sensor.logDelay,
        sensor.batteryLevel
      )
    );
  } catch (error) {
    // TODO: add error handling actions.
    console.error(error);
  }
}

function* generateTemperatureLog({
  payload: { sensor },
}: PayloadAction<CreatePayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const devManager = yield call(DependencyLocator.get, DEPENDENCY.DEV_MANAGER);
  const temperatureLogManager = yield call(
    DependencyLocator.get,
    DEPENDENCY.TEMPERATURE_LOG_MANAGER
  );
  try {
    const temperatureLog = yield call(devManager.generateTemperatureLog, sensor);
    yield call(temperatureLogManager.addNewTemperatureLog, temperatureLog);
  } catch (error) {
    // TODO: add error handling actions.
    console.error(error);
  }
}

function* generateTemperatureBreach({
  payload: { sensor },
}: PayloadAction<CreatePayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const devManager = yield call(DependencyLocator.get, DEPENDENCY.DEV_MANAGER);
  const temperatureLogManager = yield call(
    DependencyLocator.get,
    DEPENDENCY.TEMPERATURE_LOG_MANAGER
  );
  try {
    const temperatureLogs = yield call(devManager.generateBreachTemperatureLogs, sensor);
    yield call(temperatureLogManager.addNewTemperatureLogs, temperatureLogs);
    yield put(ConsecutiveBreachAction.create(sensor));
  } catch (error) {
    // TODO: add error handling actions.
    console.error(error);
  }
}

function* generateTemperatureLogs({
  payload: { sensor, min = 0, max = 10, numLogs = 10 },
}: PayloadAction<CreatePayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const utilService = yield call(DependencyLocator.get, DEPENDENCY.UTIL_SERVICE);
  const temperatureLogManager = yield call(
    DependencyLocator.get,
    DEPENDENCY.TEMPERATURE_LOG_MANAGER
  );
  try {
    const { id: sensorId, logInterval } = sensor;
    const breachLogCount = numLogs;
    const breachLogTimestamps = Array.from(Array(breachLogCount).keys()).reduce(
      (acc, i) => [...acc, moment.unix(acc[i]).subtract(logInterval, 'seconds').unix()],
      [moment().unix()]
    );

    const temperatureLogs = breachLogTimestamps.map(timestamp => {
      const id = utilService.uuid();
      const temperature = Math.floor((Math.random() * (max - min) + min) * 1000) / 1000;

      return {
        id,
        sensorId,
        logInterval,
        temperature,
        timestamp,
      };
    });

    yield call(temperatureLogManager.addNewTemperatureLogs, temperatureLogs);
    // Refresh the sensor status.
    yield put(SensorAction.fetchAll());
  } catch (error) {
    // TODO: add error handling actions.
    console.error(error);
  }
}

function* root(): SagaIterator {
  yield takeEvery(DevAction.generateSensor, generateSensor);
  yield takeEvery(DevAction.generateTemperatureLog, generateTemperatureLog);
  yield takeEvery(DevAction.generateTemperatureBreach, generateTemperatureBreach);
  yield takeEvery(DevAction.generateTemperatureLogs, generateTemperatureLogs);
}

const DevSaga = {
  root,
  generateSensor,
  generateTemperatureLog,
  generateTemperatureBreach,
  generateTemperatureLogs,
};

export { DevReducer, DevAction, DevSaga, DevSelector };
