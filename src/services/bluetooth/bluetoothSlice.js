import { createSlice } from '@reduxjs/toolkit';
import { TEMPERATURE_SYNC_STATE } from '~constants';

const initialState = {
  state: TEMPERATURE_SYNC_STATE.IN_PROGRESS,
};

const bluetoothSlice = createSlice({
  name: 'bluetooth',
  initialState,
  reducers: {
    downloadTemperatures() {},
    startTemperatureSync() {
      return { state: TEMPERATURE_SYNC_STATE.IN_PROGRESS };
    },
  },
});

export const { actions: BluetoothActions, reducer: BluetoothReducer } = bluetoothSlice;
