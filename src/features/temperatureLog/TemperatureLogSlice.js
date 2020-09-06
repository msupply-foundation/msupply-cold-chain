import { createSlice } from '@reduxjs/toolkit';

import { REDUCER_SHAPE } from '~constants';

const initialState = {
  logsBySensor: {},
};

const reducers = {
  hydrate: () => {},
  hydrateSuccessful: {
    prepare: logsBySensor => ({ payload: { logsBySensor } }),
    reducer: (draftState, { payload: { logsBySensor } }) => {
      draftState.logsBySensor = logsBySensor;
    },
  },
  hydrateFailed: () => {},
};

const { actions: TemperatureLogAction, reducer: TemperatureLogReducer } = createSlice({
  name: REDUCER_SHAPE.TEMPERATURE_LOG,
  initialState,
  reducers,
});

const TemperatureLogSelector = {
  getAll: ({ temperatureLog: { logsBySensor } }) => {
    return logsBySensor;
  },
};

const TemperatureLogSaga = {};

export { TemperatureLogAction, TemperatureLogReducer, TemperatureLogSaga, TemperatureLogSelector };
