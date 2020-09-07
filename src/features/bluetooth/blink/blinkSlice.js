import { ToastAndroid } from 'react-native';
import { createSlice } from '@reduxjs/toolkit';
import { takeEvery, call, put, getContext } from 'redux-saga/effects';

import { t } from '~translations';
import { SERVICES, REDUCER_SHAPE } from '~constants';

const initialState = {
  blinkingById: {},
};

const reducers = {
  tryBlinkSensor: {
    prepare: macAddress => ({ payload: { macAddress } }),
    reducer: () => {},
  },
  tryBlinkSensorSuccess: {
    prepare: macAddress => ({ payload: { macAddress } }),
    reducer: () => {},
  },
  tryBlinkSensorFail: {
    prepare: macAddress => ({ payload: { macAddress } }),
    reducer: () => {},
  },
};

const { actions: BlinkAction, reducer: BlinkReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER_SHAPE.BLINK,
});

function* tryBlinkSensor({ payload: { macAddress } }) {
  const getService = yield getContext('getService');
  const btService = yield call(getService, SERVICES.BLUETOOTH);

  try {
    yield call(btService.blinkWithRetries, macAddress, 10);
    yield put(BlinkAction.tryBlinkSensorSuccess());
    ToastAndroid.show(t('BLINKED_SENSOR_SUCCESS'), ToastAndroid.SHORT);
  } catch (error) {
    yield put(BlinkAction.tryBlinkSensorFail(error));
    ToastAndroid.show(t('BLINKED_SENSOR_FAILED'), ToastAndroid.SHORT);
  }
}

function* root() {
  yield takeEvery(BlinkAction.tryBlinkSensor, tryBlinkSensor);
}

const BlinkSaga = { root };
const BlinkSelector = {};

export { BlinkAction, BlinkReducer, BlinkSaga, BlinkSelector };
