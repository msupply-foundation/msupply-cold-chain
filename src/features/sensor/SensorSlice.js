import { createSlice } from '@reduxjs/toolkit';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { SERVICES } from '~constants';

const initialState = {
  byId: {},
  ids: [],
  foundSensors: [],
};

const reducers = {
  hydrate: () => {},
  hydrateSuccessful: {
    reducer: (draftState, { payload: { sensors } }) => {
      const byId = sensors.reduce((acc, sensor) => ({ [sensor.id]: sensor, ...acc }), {});
      const ids = sensors.map(({ id }) => id);

      draftState.byId = byId;
      draftState.ids = ids;
    },
    prepare: sensors => ({ payload: { sensors } }),
  },
  hydrateFailed: () => {},

  update: {
    reducer: () => {},
    prepare: (id, key, value) => ({ payload: { id, key, value } }),
  },
  updateSuccessful: {
    reducer: (draftState, { payload: { id, key, value } }) => {
      draftState.byId[id] = { ...draftState.byId[id], [key]: value };
    },
    prepare: (id, key, value) => ({ payload: { id, key, value } }),
  },
  updateFailed: () => {},

  addNewSensor: {
    reducer: () => {},
    prepare: (macAddress, logInterval) => ({ payload: { macAddress, logInterval } }),
  },
  addNewSensorSuccessful: {
    reducer: (draftState, { payload: { sensor } }) => {
      const { id, macAddress: newMac } = sensor;

      draftState.byId[id] = sensor;
      draftState.ids.push(id);
      draftState.foundSensors = draftState.foundSensors.filter(macAddress => macAddress !== newMac);
    },
    prepare: sensor => ({ payload: { sensor } }),
  },
  addNewSensorFailed: () => {},

  foundSensor: {
    reducer: (draftState, { payload: { macAddress } }) => {
      if (!draftState.foundSensors.includes(macAddress)) {
        const alreadyFound = !!Object.values(draftState.byId).find(
          ({ macAddress: existingMac }) => existingMac === macAddress
        );
        if (!alreadyFound) draftState.foundSensors.push(macAddress);
      }
    },
    prepare: macAddress => ({ payload: { macAddress } }),
  },
  clearFoundSensors: draftState => {
    draftState.foundSensors = [];
  },
};

const { actions: SensorAction, reducer: SensorReducer } = createSlice({
  name: 'sensor',
  initialState,
  reducers,
});

function* hydrate() {
  const getService = yield getContext('getService');
  const sensorManager = yield call(getService, SERVICES.SENSOR_MANAGER);
  try {
    const sensors = yield call(sensorManager.getSensors);
    yield put(SensorAction.hydrateSuccessful(sensors));
  } catch (error) {
    yield put(SensorAction.hydrateFailed(error));
  }
}

function* update({ payload: { id, key, value } }) {
  const getService = yield getContext('getService');
  const manager = yield call(getService, SERVICES.SENSOR_MANAGER);
  try {
    yield call(manager.updateField, id, key, value);
    yield put(SensorAction.updateSuccessful(id, key, value));
  } catch (e) {
    yield put(SensorAction.updateFailed());
  }
}

function* addNewSensor({ payload: { macAddress, logInterval } }) {
  const getService = yield getContext('getService');
  const sensorManager = yield call(getService, SERVICES.SENSOR_MANAGER);
  try {
    const newlyAddedSensor = yield call(sensorManager.addNewSensor, macAddress, logInterval);
    yield put(SensorAction.addNewSensorSuccessful(newlyAddedSensor));
  } catch (error) {
    yield put(SensorAction.addNewSensorFailed(error));
  }
}

function* watchSensorActions() {
  yield takeEvery(SensorAction.hydrate, hydrate);
  yield takeEvery(SensorAction.addNewSensor, addNewSensor);
  yield takeEvery(SensorAction.update, update);
}

const SensorSelector = {
  availableSensorsList: ({ sensor }) => {
    const { byId, ids } = sensor;
    return ids.map(id => ({ id, name: byId[id].name ?? byId[id].macAddress }));
  },
  foundSensorsList: ({ sensor }) => {
    const { foundSensors } = sensor;
    return foundSensors;
  },
  sensors: ({ sensor }) => {
    const { byId } = sensor;
    return byId;
  },
  sensorsList: ({ sensor }) => {
    const { byId, ids } = sensor;
    return ids.map(id => byId[id]);
  },
};

const SensorSaga = {
  watchSensorActions,
  addNewSensor,
  update,
  hydrate,
};

export { SensorSaga, SensorSelector, SensorReducer, SensorAction };
