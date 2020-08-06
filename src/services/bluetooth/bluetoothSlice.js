import { createSlice, combineReducers } from '@reduxjs/toolkit';
import {
  BLUETOOTH_SERVICE,
  REDUCER_SHAPE,
  TEMPERATURE_SYNC_STATE,
  PASSIVE_TEMPERATURE_SYNC_STATE,
} from '~constants';

export const { actions: PassiveBluetoothActions, reducer: PassiveBluetoothReducer } = createSlice({
  name: REDUCER_SHAPE.PASSIVE_BLUETOOTH,
  initialState: { timer: null, state: null },
  reducers: {
    startTimer: draftState => {
      draftState.timer = BLUETOOTH_SERVICE.DEFAULT_PASSIVE_DOWNLOAD_DELAY;
    },
    decrementTimer: draftState => {
      draftState.timer -= BLUETOOTH_SERVICE.DEFAULT_TIMER_DELAY;
    },
    completeTimer: draftState => {
      draftState.timer = null;
    },
    start: draftState => {
      draftState.state = PASSIVE_TEMPERATURE_SYNC_STATE.IN_PROGRESS;
    },
    stop: () => {},
    stopped: draftState => {
      draftState.state = PASSIVE_TEMPERATURE_SYNC_STATE.STOPPED;
    },
    complete: draftState => {
      draftState.state = PASSIVE_TEMPERATURE_SYNC_STATE.WAITING;
    },
  },
});

export const { actions: BluetoothStateActions, reducer: BluetoothStateReducer } = createSlice({
  name: REDUCER_SHAPE.BLUETOOTH_STATE,
  initialState: { state: TEMPERATURE_SYNC_STATE.ENABLED },
  reducers: {
    downloadTemperatures: () => {},
    downloadTemperaturesForSensor: {
      reducer: () => {},
      prepare: macAddress => ({ payload: { macAddress } }),
    },
    startTemperatureSync: () => {},
    scanForSensors: () => {},
    complete: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.ENABLED;
    },
    start: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.IN_PROGRESS;
    },
    disable: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.DISABLED;
    },
    error: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.ERROR;
    },
  },
});

export const BluetoothReducer = combineReducers({
  bluetooth: BluetoothStateReducer,
  passiveDownload: PassiveBluetoothReducer,
});
