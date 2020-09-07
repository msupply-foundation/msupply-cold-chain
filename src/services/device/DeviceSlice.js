import { ToastAndroid } from 'react-native';
import { createSlice } from '@reduxjs/toolkit';
import { put, takeEvery, getContext, call } from 'redux-saga/effects';

import { SERVICES, ENTITIES, REDUCER } from '~constants';

const DeviceSelector = {
  isWriting({ device }) {
    return device.isWriting;
  },
};

const initialState = {
  isWriting: false,
};

const reducers = {
  tryWriteLogFile: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: draftState => {
      draftState.isWriting = true;
      draftState.writtenPath = '';
    },
  },
  writeLogFileSuccessful: {
    prepare: path => ({ payload: { path } }),
    reducer: (draftState, { payload: { path } }) => {
      draftState.isWriting = false;
      draftState.writtenPath = path;
    },
  },
  writeLogFileFailed: draftState => {
    draftState.isWriting = false;
  },
};

const { actions: DeviceAction, reducer: DeviceReducer } = createSlice({
  name: REDUCER.DEVICE,
  initialState,
  reducers,
});

function* tryWriteLogFile({ payload: { sensorId } }) {
  const getServices = yield getContext('getServices');
  const [deviceService, databaseService] = yield call(getServices, [
    SERVICES.DEVICE,
    SERVICES.DATABASE,
  ]);

  try {
    const logs = yield call(databaseService.queryWith, ENTITIES.TEMPERATURE_LOG, { sensorId });
    const writtenPath = yield call(deviceService.writeLogFile, logs);
    yield put(DeviceAction.writeLogFileSuccessful(writtenPath));
    ToastAndroid.show('Downloaded logs successful', ToastAndroid.SHORT);
  } catch (error) {
    yield put(DeviceAction.writeLogFileFailed());
    ToastAndroid.show('Downloaded logs failed', ToastAndroid.SHORT);
  }
}

function* watchDeviceActions() {
  yield takeEvery(DeviceAction.tryWriteLogFile, tryWriteLogFile);
}

const DeviceSaga = { watchDeviceActions };

export { DeviceSelector, DeviceSaga, DeviceReducer, DeviceAction };
