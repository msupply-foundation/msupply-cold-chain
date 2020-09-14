import { createSlice } from '@reduxjs/toolkit';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { REDUCER, DEPENDENCY } from '~constants';

const initialState = {
  byId: {
    // exampleId: {
    //   id: '',
    //   macAddress: '',
    //   logDelay: 1,
    //   logInterval: 1,
    //   batteryLevel: 1,
    //   programmedDate: 1,
    // },
  },
  ids: [],
};

const reducers = {
  fetchAll: () => {},
  fetchAllSuccess: {
    prepare: sensors => ({ payload: { sensors } }),
    reducer: (draftState, { payload: { sensors } }) => {
      const byId = sensors.reduce((acc, sensor) => ({ [sensor.id]: sensor, ...acc }), {});
      const ids = sensors.map(({ id }) => id);

      draftState.byId = byId;
      draftState.ids = ids;
    },
  },
  fetchAllFail: () => {},

  update: {
    reducer: () => {},
    prepare: (id, key, value) => ({ payload: { id, key, value } }),
  },
  updateSuccess: {
    prepare: (id, key, value) => ({ payload: { id, key, value } }),
    reducer: (draftState, { payload: { id, key, value } }) => {
      draftState.byId[id] = { ...draftState.byId[id], [key]: value };
    },
  },
  updateFail: () => {},

  create: {
    prepare: (macAddress, logInterval, logDelay, batteryLevel) => ({
      payload: { macAddress, logInterval, logDelay, batteryLevel },
    }),
    reducer: () => {},
  },
  createSuccess: {
    prepare: (sensorId, sensor) => ({ payload: { sensorId, sensor } }),
    reducer: (draftState, { payload: { sensorId, sensor } }) => {
      draftState.byId[sensorId] = sensor;
      draftState.ids.push(sensorId);
    },
  },
  createFail: () => {},
};

const { actions: SensorAction, reducer: SensorReducer } = createSlice({
  name: REDUCER.SENSOR,
  initialState,
  reducers,
});

function* fetchAll() {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    const sensors = yield call(sensorManager.getSensors);
    yield put(SensorAction.fetchAllSuccess(sensors));
  } catch (error) {
    yield put(SensorAction.fetchAllFail(error));
  }
}

function* update({ payload: { id, key, value } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const manager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    yield call(manager.updateField, id, key, value);
    yield put(SensorAction.updateSuccess(id, key, value));
  } catch (e) {
    yield put(SensorAction.updateFail());
  }
}

function* create({ payload: { macAddress, logInterval, logDelay, batteryLevel } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    const newlyAddedSensor = yield call(
      sensorManager.addNewSensor,
      macAddress,
      logInterval,
      logDelay,
      batteryLevel
    );

    yield put(SensorAction.createSuccess(newlyAddedSensor));
  } catch (error) {
    yield put(SensorAction.createFail(error));
  }
}

function* root() {
  yield takeEvery(SensorAction.fetchAll, fetchAll);
  yield takeEvery(SensorAction.create, create);
  yield takeEvery(SensorAction.update, update);
}

const SensorSelector = {
  availableSensorsList: ({
    entities: {
      sensor: { byId, ids },
    },
  }) => {
    return ids.map(id => ({ id, name: byId[id].name ?? byId[id].macAddress }));
  },
  macs: ({
    entities: {
      sensor: { byId, ids },
    },
  }) => {
    return ids.map(id => byId[id].macAddress);
  },
  sensors: ({ entities: { sensor } }) => {
    const { byId } = sensor;
    return byId;
  },
  sensorsList: ({ entities: { sensor } }) => {
    const { byId, ids } = sensor;
    return ids.map(id => byId[id]);
  },
};

const SensorSaga = {
  root,
  create,
  update,
  fetchAll,
};

export { SensorSaga, SensorSelector, SensorReducer, SensorAction };
