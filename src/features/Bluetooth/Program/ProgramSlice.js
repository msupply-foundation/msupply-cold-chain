import { createSlice } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';
import { call, getContext, put, takeEvery, takeLeading } from 'redux-saga/effects';

import { DEPENDENCY, SETTING, REDUCER } from '~constants';
import { SensorAction } from '../../sensor';

const initialState = {
  programmingByMac: {},
  isProgramming: false,
};

const reducers = {
  tryProgramNewSensor: {
    prepare: (macAddress, logDelay) => ({ payload: { macAddress, logDelay } }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.programmingByMac[macAddress] = true;
    },
  },
  programNewSensorSuccess: {
    prepare: (macAddress, logDelay) => ({ payload: { macAddress, logDelay } }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.programmingByMac[macAddress] = false;
    },
  },
  programNewSensorFail: {
    prepare: (macAddress, errorMessage) => ({ payload: { macAddress, errorMessage } }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.programmingByMac[macAddress] = false;
    },
  },
  tryUpdateLogInterval: {
    prepare: (id, logInterval) => ({ payload: { id, logInterval } }),
    reducer: draftState => {
      draftState.isProgramming = true;
    },
  },
  updateLogIntervalSuccess: draftState => {
    draftState.isProgramming = false;
  },
  updateLogIntervalFail: draftState => {
    draftState.isProgramming = false;
  },
};

const { actions: ProgramAction, reducer: ProgramReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.PROGRAM,
});

export function* tryProgramNewSensor({ payload: { macAddress, logDelay } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [btService, settingManager] = yield call(DependencyLocator.get, [
    DEPENDENCY.BLUETOOTH,
    DEPENDENCY.SETTING_MANAGER,
  ]);

  try {
    const { value: logInterval } = yield call(
      settingManager.getSetting,
      SETTING.INT.DEFAULT_LOG_INTERVAL
    );
    const { batteryLevel, isDisabled } = yield call(btService.getInfoWithRetries, macAddress, 10);
    yield call(btService.updateLogIntervalWithRetries, macAddress, logInterval, 10);

    if (!isDisabled) {
      yield call(btService.toggleButtonWithRetries, macAddress, 10);
    }

    yield put(ProgramAction.programNewSensorSuccess(macAddress));
    yield put(SensorAction.addNewSensor(macAddress, logInterval, logDelay, batteryLevel));
    ToastAndroid.show(`Connected and setup ${macAddress}`, ToastAndroid.SHORT);
  } catch (e) {
    yield put(ProgramAction.programNewSensorFail(macAddress, e?.message));
    ToastAndroid.show(`Could not connect with ${macAddress}`, ToastAndroid.SHORT);
  }
}

export function* tryUpdateLogInterval({ payload: { id, logInterval } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [btService, sensorManager] = yield call(DependencyLocator.get, [
    DEPENDENCY.BLUETOOTH,
    DEPENDENCY.SENSOR_MANAGER,
  ]);

  try {
    const sensor = yield call(sensorManager.getSensorById, id);
    yield call(btService.updateLogIntervalWithRetries, sensor.macAddress, logInterval, 10);
    yield put(ProgramAction.updateLogIntervalSuccess(id));
    yield put(SensorAction.update(id, 'logInterval', logInterval));
    ToastAndroid.show('Updated log interval', ToastAndroid.SHORT);
  } catch (e) {
    yield put(ProgramAction.updateLogIntervalFail());
    ToastAndroid.show('Could not update log interval', ToastAndroid.SHORT);
  }
}

function* root() {
  yield takeLeading(ProgramAction.tryProgramNewSensor, tryProgramNewSensor);
  yield takeEvery(ProgramAction.tryUpdateLogInterval, tryUpdateLogInterval);
}

const ProgramSaga = { root };

const ProgramSelector = {
  programmingByMac: ({
    bluetooth: {
      program: { programmingByMac },
    },
  }) => {
    return programmingByMac;
  },
  isUpdating: ({
    bluetooth: {
      program: { isUpdating },
    },
  }) => {
    return isUpdating;
  },
};

export { ProgramAction, ProgramReducer, ProgramSaga, ProgramSelector };
