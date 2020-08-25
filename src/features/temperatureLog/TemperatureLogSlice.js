import { createSlice } from '@reduxjs/toolkit';

import { REDUCER_SHAPE } from '~constants';

const initialState = {};
const reducers = {};
const { actions: TemperatureLogAction, reducer: TemperatureLogReducer } = createSlice({
  name: REDUCER_SHAPE.TEMPERATURE_LOG,
  initialState,
  reducers,
});

const TemperatureLogSelector = {};

function* watchTemperatureLogActions() {
  yield;
}

const TemperatureLogSaga = { watchTemperatureLogActions };

export { TemperatureLogAction, TemperatureLogReducer, TemperatureLogSaga, TemperatureLogSelector };
