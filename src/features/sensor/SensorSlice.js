import { createSlice } from '@reduxjs/toolkit';

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

export const SensorSelector = {
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
};

export const { actions: SensorAction, reducer: SensorReducer } = createSlice({
  name: 'sensor',
  initialState,
  reducers,
});
