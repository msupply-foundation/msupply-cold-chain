import { ToastAndroid } from 'react-native';
import { createSlice } from '@reduxjs/toolkit';
import { put, takeEvery, getContext, call } from 'redux-saga/effects';

import { SERVICES, REDUCER } from '~constants';

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
    prepare: (sensorId, username, comment) => ({ payload: { sensorId, username, comment } }),
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
  tryEmailLogFile: {
    prepare: (sensorId, username, comment) => ({ payload: { sensorId, username, comment } }),
    reducer: () => {},
  },
  emailLogFileSuccessful: () => {},
  emailLogFileFailed: () => {},
};

const { actions: DeviceAction, reducer: DeviceReducer } = createSlice({
  name: REDUCER.DEVICE,
  initialState,
  reducers,
});

function* tryEmailLogFile({ payload: { sensorId, username, comment } }) {
  const getServices = yield getContext('getServices');
  const [deviceService, sensorManager, breachManager, breachConfigManager] = yield call(
    getServices,
    [
      SERVICES.DEVICE,
      SERVICES.SENSOR_MANAGER,
      SERVICES.BREACH_MANAGER,
      SERVICES.BREACH_CONFIGURATION_MANAGER,
    ]
  );

  try {
    const sensor = yield call(sensorManager.getSensorById, sensorId);
    const sensorStats = yield call(sensorManager.getStats, sensorId);
    const sensorReport = yield call(sensorManager.getSensorReport, sensorId);
    const logsReport = yield call(sensorManager.getLogsReport, sensorId);
    const breachReport = yield call(breachManager.getBreachReport, sensorId);
    const breachConfigReport = yield call(breachConfigManager.report, sensorId);

    const writtenPath = yield call(
      deviceService.emailLogFile,
      sensor,
      sensorReport,
      sensorStats,
      logsReport,
      breachReport,
      breachConfigReport,
      username,
      comment
    );
    yield put(DeviceAction.emailLogFileSuccessful(writtenPath));
  } catch (error) {
    yield put(DeviceAction.emailLogFileFailed());
  }
}

function* tryWriteLogFile({ payload: { sensorId, username, comment } }) {
  const getServices = yield getContext('getServices');
  const [deviceService, sensorManager, breachManager, breachConfigManager] = yield call(
    getServices,
    [
      SERVICES.DEVICE,
      SERVICES.SENSOR_MANAGER,
      SERVICES.BREACH_MANAGER,
      SERVICES.BREACH_CONFIGURATION_MANAGER,
    ]
  );

  try {
    const sensor = yield call(sensorManager.getSensorById, sensorId);
    const sensorStats = yield call(sensorManager.getStats, sensorId);
    const sensorReport = yield call(sensorManager.getSensorReport, sensorId);
    const logsReport = yield call(sensorManager.getLogsReport, sensorId);
    const breachReport = yield call(breachManager.getBreachReport, sensorId);
    const breachConfigReport = yield call(breachConfigManager.report, sensorId);

    const writtenPath = yield call(
      deviceService.writeLogFile,
      sensor,
      sensorReport,
      sensorStats,
      logsReport,
      breachReport,
      breachConfigReport,
      username,
      comment
    );
    yield put(DeviceAction.writeLogFileSuccessful(writtenPath));
    ToastAndroid.show('Downloaded logs successful', ToastAndroid.SHORT);
  } catch (error) {
    yield put(DeviceAction.writeLogFileFailed());
    ToastAndroid.show('Downloaded logs failed', ToastAndroid.SHORT);
  }
}

function* watchDeviceActions() {
  yield takeEvery(DeviceAction.tryWriteLogFile, tryWriteLogFile);
  yield takeEvery(DeviceAction.tryEmailLogFile, tryEmailLogFile);
}

const DeviceSaga = { watchDeviceActions };

export { DeviceSelector, DeviceSaga, DeviceReducer, DeviceAction };
