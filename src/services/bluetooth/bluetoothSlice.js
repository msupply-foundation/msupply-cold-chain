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

export const { actions: UpdateSensorAction, reducer: UpdateSensorReducer } = createSlice({
  name: 'updateSensor',
  initialState: {
    lastAttempt: true,
    updating: true,
  },
  reducers: {
    tryUpdateLogInterval: {
      reducer: draftState => {
        draftState.updatingSensor = true;
      },
      prepare: (id, macAddress, logInterval) => ({ payload: { macAddress, logInterval, id } }),
    },
    updateSensorSucceeded: draftState => {
      draftState.updatingSensor = false;
      draftState.lastAttempt = true;
    },
    updateSensorFailed: draftState => {
      draftState.updatingSensor = false;
      draftState.lastAttempt = false;
    },

    tryConnectWithNewSensor: {
      reducer: draftState => {
        draftState.updatingSensor = true;
      },
      prepare: (macAddress, logDelay) => ({ payload: { macAddress, logDelay } }),
    },
  },
});

export const { actions: BluetoothStateActions, reducer: BluetoothStateReducer } = createSlice({
  name: REDUCER_SHAPE.BLUETOOTH_STATE,
  initialState: {
    state: TEMPERATURE_SYNC_STATE.ENABLED,
    updatingSensor: false,
    blinkingSensor: false,
    blinkWasSuccessful: true,
    findingSensors: false,
  },
  reducers: {
    startWatchingBatteryLevels: () => {},
    stopWatchingBatteryLevels: () => {},
    updateBatteryLevels: () => {},
    updateBatteryLevelsSuccessful: () => {},
    updateBatteryLevelsFailed: () => {},
    downloadTemperatures: () => {},
    downloadTemperaturesForSensor: {
      reducer: () => {},
      prepare: macAddress => ({ payload: { macAddress } }),
    },
    startTemperatureSync: () => {},

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

    findSensors: () => {},
    findSensorsFailed: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.ERROR;
    },

    startScanning: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.IN_PROGRESS;
      draftState.findingSensors = true;
    },
    startScanningFailed: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.ERROR;
      draftState.findingSensors = false;
    },

    stopScanning: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.ENABLED;
      draftState.findingSensors = false;
    },
    stopScanningSucceeded: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.ENABLED;
    },
    stopScanningFailed: draftState => {
      draftState.state = TEMPERATURE_SYNC_STATE.ERROR;
    },

    tryUpdateLogInterval: {
      reducer: draftState => {
        draftState.updatingSensor = true;
        draftState.state = TEMPERATURE_SYNC_STATE.IN_PROGRESS;
      },
      prepare: (id, macAddress, logInterval) => ({ payload: { macAddress, logInterval, id } }),
    },
    updateSensorSucceeded: draftState => {
      draftState.updatingSensor = false;
      draftState.state = TEMPERATURE_SYNC_STATE.ENABLED;
    },
    updateSensorFailed: draftState => {
      draftState.updatingSensor = false;
      draftState.state = TEMPERATURE_SYNC_STATE.ERROR;
    },

    scanForSensors: () => {},

    tryConnectWithNewSensor: {
      reducer: draftState => {
        draftState.updatingSensor = true;
        draftState.state = TEMPERATURE_SYNC_STATE.IN_PROGRESS;
      },
      prepare: (macAddress, logDelay) => ({ payload: { macAddress, logDelay } }),
    },

    tryBlinkSensor: {
      reducer: draftState => {
        draftState.blinkingSensor = true;
        draftState.state = TEMPERATURE_SYNC_STATE.IN_PROGRESS;
      },
      prepare: macAddress => ({ payload: { macAddress } }),
    },
    blinkSensorSucceeded: draftState => {
      draftState.blinkingSensor = false;
      draftState.state = TEMPERATURE_SYNC_STATE.ENABLED;
      draftState.blinkWasSuccessful = true;
    },
    blinkSensorFailed: draftState => {
      draftState.blinkingSensor = false;
      draftState.state = TEMPERATURE_SYNC_STATE.ERROR;
      draftState.blinkWasSuccessful = false;
    },
  },
});

export const BluetoothReducer = combineReducers({
  bluetooth: BluetoothStateReducer,
  passiveDownload: PassiveBluetoothReducer,
  updateSensor: UpdateSensorReducer,
});
