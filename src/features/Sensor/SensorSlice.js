import { createSlice } from '@reduxjs/toolkit';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { createSelector } from 'reselect';
import { DEPENDENCY } from '~constants';

const initialState = {
  byId: {},
  ids: [],
  foundSensors: [],
};

const reducers = {
  updateBatteryLevel: {
    prepare: (sensorId, newBatteryLevel) => ({
      payload: { batteryLevel: newBatteryLevel, sensorId },
    }),
    reducer: () => {},
  },
  updateBatteryLevelSuccessful: {
    prepare: (sensorId, batteryLevel) => ({ payload: { sensorId, batteryLevel } }),
    reducer: (draftState, { payload: { batteryLevel, sensorId } }) => {
      draftState.status[sensorId].batteryLevel = batteryLevel;
    },
  },
  updateBatteryLevelFailed: () => {},

  updateLogDelay: {
    prepare: (sensorId, newLogDelay) => ({ payload: { logDelay: newLogDelay, sensorId } }),
    reducer: () => {},
  },
  updateLogDelaySuccessful: () => {},
  updateLogDelayFailed: () => {},

  toggleDownloading: {
    prepare: (sensorId, isDownloading) => ({ payload: { isDownloading, sensorId } }),
    reducer: (draftState, { payload: { isDownloading, sensorId } }) => {
      draftState.status[sensorId].isDownloading = isDownloading;
    },
  },

  getSensor: { prepare: () => {}, reducer: () => {} },
  getSensorSuccessful: {
    prepare: () => {},
    reducer: (draftState, { payload: { sensor } }) => {
      const { id } = sensor;
      draftState.byId[id] = sensor;

      if (!draftState.ids.includes(id)) {
        draftState.ids.push(id);
      }
    },
  },
  getSensorFailed: () => {},

  getSensorState: { prepare: sensorId => ({ payload: { sensorId } }), reducer: () => {} },
  getSensorStateSuccessful: {
    prepare: (sensorId, state) => ({ payload: { sensorId, state } }),
    reducer: (draftState, { payload: { sensorId, state } }) => {
      draftState.status[sensorId] = state;
    },
  },
  getSensorStateFailed: () => {},

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
    prepare: (macAddress, logInterval, logDelay, batteryLevel) => ({
      payload: { macAddress, logInterval, logDelay, batteryLevel },
    }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.foundSensors = draftState.foundSensors.filter(newMac => macAddress !== newMac);
    },
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
        if (!alreadyFound) {
          draftState.foundSensors.push(macAddress);
        }
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
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);

  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    const sensors = yield call(sensorManager.getSensors);
    yield put(SensorAction.hydrateSuccessful(sensors));
  } catch (error) {
    yield put(SensorAction.hydrateFailed(error));
  }
}

function* update({ payload: { id, key, value } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const manager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    yield call(manager.updateField, id, key, value);
    yield put(SensorAction.updateSuccessful(id, key, value));
  } catch (e) {
    yield put(SensorAction.updateFailed());
  }
}

function* addNewSensor({ payload: { macAddress, logInterval, logDelay, batteryLevel } }) {
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

    yield put(SensorAction.addNewSensorSuccessful(newlyAddedSensor));
    yield put(SensorAction.getSensorState(newlyAddedSensor.id));
  } catch (error) {
    yield put(SensorAction.addNewSensorFailed(error));
  }
}

function* getSensorState({ payload: { sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    const state = yield call(sensorManager.getSensorState, sensorId);
    yield put(SensorAction.getSensorStateSuccessful(sensorId, state));
  } catch (error) {
    yield put(SensorAction.getSensorStateFailed(error));
  }
}

function* updateLogDelay({ payload: { logDelay, sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);

  try {
    yield call(sensorManager.updateLogDelay, sensorId, logDelay);
    yield put(SensorAction.updateLogDelaySuccessful);
    yield put(SensorAction.getSensor(sensorId));
    // eslint-disable-next-line no-empty
  } catch (error) {}
}

function* updateBatteryLevel({ payload: { sensorId, batteryLevel } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    yield call(sensorManager.updateBatteryLevel, sensorId, batteryLevel);
    yield put(SensorAction.updateBatteryLevelSuccessful(sensorId, batteryLevel));
  } catch (error) {
    yield put(SensorAction.updateBatteryLevelFailed());
  }
}

function* watchSensorActions() {
  yield takeEvery(SensorAction.hydrate, hydrate);
  yield takeEvery(SensorAction.addNewSensor, addNewSensor);
  yield takeEvery(SensorAction.update, update);
  yield takeEvery(SensorAction.getSensorState, getSensorState);
  yield takeEvery(SensorAction.updateLogDelay, updateLogDelay);
  yield takeEvery(SensorAction.updateBatteryLevel, updateBatteryLevel);
}

const selectById = ({ sensor: { byId } }) => {
  return byId;
};

const selectIds = ({ sensor: { ids } }) => {
  return ids;
};

const SensorSelector = {
  availableSensorsList: createSelector([selectById, selectIds], (byId, ids) => {
    return ids.map(id => ({ id, name: byId[id].name ?? byId[id].macAddress }));
  }),
  macAddress: ({ sensor }, { id }) => {
    return sensor.byId[id].macAddress;
  },
  macs: ({ sensor: { byId, ids } }) => {
    return ids.map(id => byId[id].macAddress);
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
  sensorIds: ({ sensor: { ids } }) => {
    return ids;
  },
  status: ({ sensor: { status } }) => {
    return status;
  },
};

const SensorSaga = {
  watchSensorActions,
  addNewSensor,
  update,
  hydrate,
};

export { SensorSaga, SensorSelector, SensorReducer, SensorAction };
