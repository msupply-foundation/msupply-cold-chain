import { createSlice, combineReducers } from '@reduxjs/toolkit';
import { REDUCER } from '~constants';

export const { actions: SensorsActions, reducer: SensorsReducer } = createSlice({
  name: REDUCER.SENSORS,
  initialState: { sensorIds: [], byId: {} },
  reducers: {
    setSensors: {
      reducer: (draftState, action) => {
        const { payload } = action;
        const { sensors } = payload;

        const byId = sensors.reduce((acc, sensor) => {
          const { id } = sensor;
          return { ...acc, [id]: sensor };
        }, {});

        const sensorIds = sensors.map(({ id }) => id);

        draftState.byId = byId;
        draftState.sensorIds = sensorIds;
      },
      prepare: sensors => ({ payload: { sensors } }),
    },

    saveSensors: {
      reducer: () => {},
      prepare: sensors => ({ payload: { sensors } }),
    },
  },
});

export const { actions: TemperatureLogActions, reducer: TemperatureLogReducer } = createSlice({
  name: REDUCER.TEMPERATURE_LOGS,
  initialState: { bySensorId: {}, fromDate: null, toDate: null },
  reducers: {
    addRandomLogs: {
      reducer: () => {},
      prepare: id => ({ payload: { id } }),
    },
    saveTemperatureLogs: {
      reducer: () => {},
      prepare: temperatureLogs => ({ payload: { temperatureLogs } }),
    },
    saveSensorLogs: {
      reducer: () => {},
      prepare: (data, macAddress) => ({ payload: { data, macAddress } }),
    },
    setTemperatureLogs: {
      prepare: temperatureLogs => ({ payload: { temperatureLogs } }),
      reducer: () => {},
    },
    createTemperatureLogs: {
      prepare: macAddress => ({ payload: { macAddress } }),
      reducer: () => {},
    },
    savedTemperatureLogs: {
      prepare: (macAddress, logs) => ({ payload: { macAddress, logs } }),
      reducer: () => {},
    },
    createBreaches: {
      prepare: macAddress => ({ payload: { macAddress } }),
      reducer: () => {},
    },
    savedBreaches: {
      prepare: (createdBreaches, endedBreaches) => ({
        payload: { createdBreaches, endedBreaches },
      }),
      reducer: () => {},
    },
  },
});

export const DatabaseReducer = combineReducers({
  sensors: SensorsReducer,
  temperatureLogs: TemperatureLogReducer,
});
