import { SagaIterator } from '@redux-saga/types';
import { RootState } from './../../../common/store/store';
import { ToastAndroid } from 'react-native';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { takeEvery, call, put, getContext } from 'redux-saga/effects';

import { t } from '../../../common/translations';
import { DEPENDENCY, REDUCER } from '../../../common/constants';

interface BlinkSliceState {
  blinkingByMac: Record<string, boolean>;
}

export const BlinkInitialState: BlinkSliceState = {
  blinkingByMac: {},
};

interface TryBlinkPayload {
  macAddress: string;
}

interface TryBlinkSensorSuccessPayload {
  macAddress: string;
}

interface TryBlinkSensorFailPayload {
  macAddress: string;
}

const reducers = {
  tryBlinkSensor: {
    prepare: (macAddress: string) => ({ payload: { macAddress } }),
    reducer: (
      draftState: BlinkSliceState,
      { payload: { macAddress } }: PayloadAction<TryBlinkPayload>
    ) => {
      draftState.blinkingByMac[macAddress] = true;
    },
  },
  tryBlinkSensorSuccess: {
    prepare: (macAddress: string) => ({ payload: { macAddress } }),
    reducer: (
      draftState: BlinkSliceState,
      { payload: { macAddress } }: PayloadAction<TryBlinkSensorSuccessPayload>
    ) => {
      draftState.blinkingByMac[macAddress] = false;
    },
  },
  tryBlinkSensorFail: {
    prepare: (macAddress: string) => ({ payload: { macAddress } }),
    reducer: (
      draftState: BlinkSliceState,
      { payload: { macAddress } }: PayloadAction<TryBlinkSensorFailPayload>
    ) => {
      draftState.blinkingByMac[macAddress] = false;
    },
  },
};

const { actions: BlinkAction, reducer: BlinkReducer } = createSlice({
  initialState: BlinkInitialState,
  reducers,
  name: REDUCER.BLINK,
});

const BlinkSelector = {
  isBlinking: ({
    bluetooth: {
      blink: { blinkingByMac },
    },
  }: RootState): Record<string, boolean> => {
    return blinkingByMac;
  },
};

function* tryBlinkSensor({
  payload: { macAddress },
}: PayloadAction<TryBlinkPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const btService = yield call(DependencyLocator.get, DEPENDENCY.BLUETOOTH);

  try {
    yield call(btService.blinkWithRetries, macAddress, 10);
    yield put(BlinkAction.tryBlinkSensorSuccess(macAddress));
    ToastAndroid.show(t('BLINKED_SENSOR_SUCCESS'), ToastAndroid.SHORT);
  } catch (error) {
    yield put(BlinkAction.tryBlinkSensorFail(macAddress));
    ToastAndroid.show(t('BLINKED_SENSOR_FAILED'), ToastAndroid.SHORT);
  }
}

function* root(): SagaIterator {
  yield takeEvery(BlinkAction.tryBlinkSensor, tryBlinkSensor);
}

const BlinkSaga = { root };

export { BlinkAction, BlinkReducer, BlinkSaga, BlinkSelector };
