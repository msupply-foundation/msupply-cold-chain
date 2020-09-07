import { NativeModules } from 'react-native';
import { createSlice } from '@reduxjs/toolkit';
import { getContext, call, put, takeLeading } from 'redux-saga/effects';
import { SERVICES, SETTING, REDUCER } from '~constants';

import { SensorAction } from '../../sensor';

const initialState = {};
const reducers = {
  tryConnectWithNewSensor: {
    prepare: (macAddress, logDelay) => ({ payload: { macAddress, logDelay } }),
    reducer: () => {},
  },
  connectWithNewSensorSuccess: {
    prepare: macAddress => ({ payload: { macAddress } }),
    reducer: () => {},
  },
  connectWithNewSensorFail: {
    prepare: () => ({}),
    reducer: () => {},
  },
};

const { actions: NewSensorAction, reducer: NewSensorReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.NEW_SENSOR,
});

const NewSensorSelector = {};

export function* connectWithNewSensor({ payload: { macAddress, logDelay } }) {
  const getServices = yield getContext('getServices');
  const [btService, settingManager] = yield call(getServices, [
    SERVICES.BLUETOOTH,
    SERVICES.SETTING_MANAGER,
  ]);

  try {
    const { value: logInterval } = yield call(
      settingManager.getSetting,
      SETTING.INT.DEFAULT_LOG_INTERVAL
    );
    yield call(btService.updateLogIntervalWithRetries, macAddress, logInterval, 10);
    const { data, success } = yield call(NativeModules.SussolBleManager.getDevices, 307, '');
    let batteryLevel = 100;
    if (success && data) {
      const advertisement = data.find(adv => adv.macAddress === macAddress);
      batteryLevel = advertisement.batteryLevel;
    }
    yield put(NewSensorAction.connectWithNewSensorSuccess(macAddress));
    yield put(SensorAction.addNewSensor(macAddress, logInterval, logDelay, batteryLevel));
  } catch (e) {
    yield put(NewSensorAction.connectWithNewSensorFail());
  }
}

function* root() {
  yield takeLeading(NewSensorAction.tryConnectWithNewSensor, connectWithNewSensor);
}

const NewSensorSaga = { root };

export { NewSensorAction, NewSensorReducer, NewSensorSaga, NewSensorSelector };
