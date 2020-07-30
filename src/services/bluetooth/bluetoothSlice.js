import { createSlice, combineReducers } from '@reduxjs/toolkit';
import { MILLISECONDS, REDUCER_SHAPE, TEMPERATURE_SYNC_STATE } from '~constants';

export const { actions: PassiveBluetoothActions, reducer: PassiveBluetoothReducer } = createSlice({
  name: REDUCER_SHAPE.PASSIVE_BLUETOOTH,
  initialState: { timer: null, state: null },
  reducers: {
    startTimer: () => ({ timer: MILLISECONDS.TEN_MINUTES }),
    decrementTimer: state => ({ timer: state.timer - MILLISECONDS.ONE_SECOND }),
    completeTimer: () => ({ timer: null }),
    start: () => {},
    stop: () => ({ timer: null }),
  },
});

export const { actions: BluetoothStateActions, reducer: BluetoothStateReducer } = createSlice({
  name: REDUCER_SHAPE.BLUETOOTH_STATE,
  initialState: { state: TEMPERATURE_SYNC_STATE.ENABLED },
  reducers: {
    downloadTemperatures: {
      reducer: () => {},
      prepare: macAddress => ({ payload: { macAddress } }),
    },
    startTemperatureSync: () => {},
    scanForSensors: () => {},
    complete: () => ({ state: TEMPERATURE_SYNC_STATE.ENABLED }),
    start: () => ({ state: TEMPERATURE_SYNC_STATE.IN_PROGRESS }),
    disable: () => ({ state: TEMPERATURE_SYNC_STATE.DISABLED }),
    error: () => ({ state: TEMPERATURE_SYNC_STATE.ERROR }),
    setService: {
      reducer: () => {},
      prepare: bluetoothService => ({ payload: { bluetoothService } }),
    },
  },
});

export const BluetoothReducer = combineReducers({
  bluetooth: BluetoothStateReducer,
  passiveDownload: PassiveBluetoothReducer,
});
