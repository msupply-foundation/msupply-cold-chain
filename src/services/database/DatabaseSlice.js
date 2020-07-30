import { createSlice, combineReducers } from '@reduxjs/toolkit';
import { REDUCER_SHAPE } from '~constants';

export const { actions: SensorsActions, reducer: SensorsReducer } = createSlice({
  name: REDUCER_SHAPE.SENSORS,
  initialState: { sensorIds: [], byId: {} },
  reducers: {
    setSensors: {
      reducer: (_, action) => {
        const { payload } = action;
        const { sensors } = payload;

        const byId = sensors.reduce((acc, sensor) => {
          const { id } = sensor;
          acc[id] = sensor;
          return acc;
        }, {});

        const sensorIds = sensors.map(({ id }) => id);

        return { byId, sensorIds };
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
  name: REDUCER_SHAPE.TEMPERATURE_LOGS,
  initialState: { bySensorId: {}, fromDate: null, toDate: null },
  reducers: {
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
  },
});

export const DatabaseReducer = combineReducers({
  sensors: SensorsReducer,
  temperatureLogs: TemperatureLogReducer,
});
