import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';
import { call, getContext, put, retry, takeEvery, takeLeading } from 'redux-saga/effects';

import { SettingManager } from '~features/Entities/Setting/SettingManager';
import { BleService, InfoLog } from '~services/Bluetooth/BleService';
import { RootState } from '~store/store';
import { DEPENDENCY, REDUCER } from '~constants';

interface ProgramSliceState {
  programmingByMac: Record<string, boolean>;
  isProgramming: boolean;
}

export const ProgramInitialState: ProgramSliceState = {
  programmingByMac: {},
  isProgramming: false,
};

interface TryProgramNewSensorPayload {
  macAddress: string;
  logInterval?: number;
  logDelay: number;
}

interface ProgramNewSensorSuccessPayload {
  macAddress: string;
  logInterval: number;
  logDelay: number;
  batteryLevel: number | null;
}

interface ProgramNewSensorFailPayload {
  macAddress: string;
}

interface TryUpdateLogInterval {
  macAddress: string;
  logInterval: number;
}

const reducers = {
  tryProgramNewSensor: {
    prepare: (macAddress: string, logDelay: number) => ({ payload: { macAddress, logDelay } }),
    reducer: (
      draftState: ProgramSliceState,
      { payload: { macAddress } }: PayloadAction<TryProgramNewSensorPayload>
    ) => {
      draftState.programmingByMac[macAddress] = true;
      draftState.isProgramming = true;
    },
  },
  programNewSensorSuccess: {
    prepare: (
      macAddress: string,
      logInterval: number,
      logDelay: number,
      batteryLevel: number | null
    ) => ({
      payload: { macAddress, logInterval, logDelay, batteryLevel },
    }),
    reducer: (
      draftState: ProgramSliceState,
      { payload: { macAddress } }: PayloadAction<ProgramNewSensorSuccessPayload>
    ) => {
      draftState.programmingByMac[macAddress] = false;
      draftState.isProgramming = false;
    },
  },
  programNewSensorFail: {
    prepare: (macAddress: string, errorMessage: string) => ({
      payload: { macAddress, errorMessage },
    }),
    reducer: (
      draftState: ProgramSliceState,
      { payload: { macAddress } }: PayloadAction<ProgramNewSensorFailPayload>
    ) => {
      draftState.programmingByMac[macAddress] = false;
      draftState.isProgramming = false;
    },
  },
  tryUpdateLogInterval: {
    prepare: (macAddress: string, logInterval: number) => ({
      payload: { macAddress, logInterval },
    }),
    reducer: (draftState: ProgramSliceState) => {
      draftState.isProgramming = true;
    },
  },
  updateLogIntervalSuccess: {
    prepare: (id: string, logInterval: number) => ({ payload: { id, logInterval } }),
    reducer: (draftState: ProgramSliceState) => {
      draftState.isProgramming = false;
    },
  },
  updateLogIntervalFail: (draftState: ProgramSliceState) => {
    draftState.isProgramming = false;
  },
};

const { actions: ProgramAction, reducer: ProgramReducer } = createSlice({
  initialState: ProgramInitialState,
  reducers,
  name: REDUCER.PROGRAM,
});

export function* tryProgramNewSensor({
  payload: { macAddress, logDelay },
}: PayloadAction<TryProgramNewSensorPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [btService, settingManager]: [
    BleService,
    SettingManager
  ] = yield call(DependencyLocator.get, [DEPENDENCY.BLUETOOTH, DEPENDENCY.SETTING_MANAGER]);

  try {
    const logInterval: number = yield call(settingManager.getSetting, 'defaultLogInterval');
    const { batteryLevel, isDisabled }: InfoLog = yield retry(10, 0, btService.getInfo, macAddress);
    yield retry(10, 0, btService.updateLogInterval, macAddress, logInterval);

    if (!isDisabled) {
      yield retry(10, 0, btService.toggleButton, macAddress);
    }

    yield put(
      ProgramAction.programNewSensorSuccess(macAddress, logInterval, logDelay, batteryLevel)
    );
    ToastAndroid.show(`Connected and setup ${macAddress}`, ToastAndroid.SHORT);
  } catch (e) {
    yield put(ProgramAction.programNewSensorFail(macAddress, e?.toString()));
    ToastAndroid.show(`Could not connect with ${macAddress}`, ToastAndroid.SHORT);
  }
}

export function* tryUpdateLogInterval({
  payload: { macAddress, logInterval },
}: PayloadAction<TryUpdateLogInterval>): SagaIterator {
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

function* root(): SagaIterator {
  yield takeLeading(ProgramAction.tryProgramNewSensor, tryProgramNewSensor);
  yield takeEvery(ProgramAction.tryUpdateLogInterval, tryUpdateLogInterval);
}

const ProgramSaga = { root, tryUpdateLogInterval, tryProgramNewSensor };

const ProgramSelector = {
  programmingByMac: ({
    bluetooth: {
      program: { programmingByMac },
    },
  }: RootState): Record<string, boolean> => {
    return programmingByMac;
  },
  isProgramming: ({
    bluetooth: {
      program: { isProgramming },
    },
  }: RootState): boolean => {
    return isProgramming;
  },
};

export { ProgramAction, ProgramReducer, ProgramSaga, ProgramSelector };
