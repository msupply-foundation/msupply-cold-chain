import { createSlice } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';
import { call, getContext, put, retry, takeEvery, takeLeading } from 'redux-saga/effects';

import { DEPENDENCY, SETTING, REDUCER } from '~constants';

export const ProgramInitialState = {
  programmingByMac: {},
  isProgramming: false,
};

const reducers = {
  tryProgramNewSensor: {
    prepare: (macAddress, logDelay) => ({ payload: { macAddress, logDelay } }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.programmingByMac[macAddress] = true;
      draftState.isProgramming = true;
    },
  },
  programNewSensorSuccess: {
    prepare: (macAddress, logInterval, logDelay, batteryLevel) => ({
      payload: { macAddress, logInterval, logDelay, batteryLevel },
    }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.programmingByMac[macAddress] = false;
      draftState.isProgramming = false;
    },
  },
  programNewSensorFail: {
    prepare: (macAddress, errorMessage) => ({ payload: { macAddress, errorMessage } }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.programmingByMac[macAddress] = false;
      draftState.isProgramming = false;
    },
  },
  tryUpdateLogInterval: {
    prepare: (macAddress, logInterval) => ({ payload: { macAddress, logInterval } }),
    reducer: draftState => {
      draftState.isProgramming = true;
    },
  },
  updateLogIntervalSuccess: {
    prepare: (id, logInterval) => ({ payload: { id, logInterval } }),
    reducer: draftState => {
      draftState.isProgramming = false;
    },
  },
  updateLogIntervalFail: draftState => {
    draftState.isProgramming = false;
  },
};

const { actions: ProgramAction, reducer: ProgramReducer } = createSlice({
  initialState: ProgramInitialState,
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
    const { batteryLevel, isDisabled } = yield retry(10, 0, btService.getInfo, macAddress);
    yield retry(10, 0, btService.updateLogInterval, macAddress, logInterval);

    if (!isDisabled) {
      yield retry(10, 0, btService.toggleButton, macAddress);
    }

    yield put(
      ProgramAction.programNewSensorSuccess(macAddress, logInterval, logDelay, batteryLevel)
    );
    ToastAndroid.show(`Connected and setup ${macAddress}`, ToastAndroid.SHORT);
  } catch (e) {
    yield put(ProgramAction.programNewSensorFail(macAddress));
    ToastAndroid.show(`Could not connect with ${macAddress}`, ToastAndroid.SHORT);
  }
}

export function* tryUpdateLogInterval({ payload: { macAddress, logInterval } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [btService, sensorManager] = yield call(DependencyLocator.get, [
    DEPENDENCY.BLUETOOTH,
    DEPENDENCY.SENSOR_MANAGER,
  ]);

  try {
    const sensor = yield call(sensorManager.getSensorByMac, macAddress);
    yield retry(10, 0, btService.updateLogInterval, sensor.macAddress, logInterval);
    yield put(ProgramAction.updateLogIntervalSuccess(sensor.id, logInterval));
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

const ProgramSaga = { root, tryUpdateLogInterval, tryProgramNewSensor };

const ProgramSelector = {
  programmingByMac: ({
    bluetooth: {
      program: { programmingByMac },
    },
  }) => {
    return programmingByMac;
  },
  isProgramming: ({
    bluetooth: {
      program: { isProgramming },
    },
  }) => {
    return isProgramming;
  },
};

export { ProgramAction, ProgramReducer, ProgramSaga, ProgramSelector };
