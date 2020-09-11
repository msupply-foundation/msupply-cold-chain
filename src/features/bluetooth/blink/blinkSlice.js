import { ToastAndroid } from 'react-native';
import { createSlice } from '@reduxjs/toolkit';
import { takeEvery, call, put, getContext } from 'redux-saga/effects';

import { t } from '~translations';
import { SERVICES, REDUCER } from '~constants';

const initialState = {
  blinkingByMac: {},
};

const reducers = {
  tryBlinkSensor: {
    prepare: macAddress => ({ payload: { macAddress } }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.blinkingByMac[macAddress] = true;
    },
  },
  tryBlinkSensorSuccess: {
    prepare: macAddress => ({ payload: { macAddress } }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.blinkingByMac[macAddress] = false;
    },
  },
  tryBlinkSensorFail: {
    prepare: macAddress => ({ payload: { macAddress } }),
    reducer: (draftState, { payload: { macAddress } }) => {
      draftState.blinkingByMac[macAddress] = false;
    },
  },
};

const { actions: BlinkAction, reducer: BlinkReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.BLINK,
});

const BlinkSelector = {
  isBlinking: ({
    bluetooth: {
      blink: { blinkingByMac },
    },
  }) => {
    return blinkingByMac;
  },
};

function* tryBlinkSensor({ payload: { macAddress } }) {
  const DependencyLocator = yield getContext('DependencyLocator');
  const btService = yield call(DependencyLocator.get, SERVICES.BLUETOOTH);

  try {
    yield call(btService.blinkWithRetries, macAddress, 10);
    yield put(BlinkAction.tryBlinkSensorSuccess(macAddress));
    ToastAndroid.show(t('BLINKED_SENSOR_SUCCESS'), ToastAndroid.SHORT);
  } catch (error) {
    yield put(BlinkAction.tryBlinkSensorFail(macAddress, error?.message));
    ToastAndroid.show(t('BLINKED_SENSOR_FAILED'), ToastAndroid.SHORT);
  }
}

function* root() {
  yield takeEvery(BlinkAction.tryBlinkSensor, tryBlinkSensor);
}

const BlinkSaga = { root };

export { BlinkAction, BlinkReducer, BlinkSaga, BlinkSelector };
