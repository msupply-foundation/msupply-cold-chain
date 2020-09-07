import { ToastAndroid } from 'react-native';
import { take, takeEvery, getContext, call, put, fork, race, delay, all } from 'redux-saga/effects';
import { createSlice } from '@reduxjs/toolkit';
import { SETTING, SERVICES, REDUCER_SHAPE } from '~constants';
import { BreachAction } from '../breach';
import { SensorAction } from '../sensor';

const initialState = {
  nextDownloadTime: {},
  nextPassiveDownloadTime: 0,
  enabled: false,
};
const reducers = {
  startPassiveDownloading: draftState => {
    draftState.enabled = true;
  },
  stopPassiveDownloading: draftState => {
    draftState.enabled = false;
  },
  updateSensorNextDownloadTime: {
    prepare: (sensorId, nextDownloadTime) => ({ payload: { sensorId, nextDownloadTime } }),
    reducer: (draftState, { payload: { sensorId, nextDownloadTime } }) => {
      draftState.nextDownloadTime[sensorId] = nextDownloadTime;
    },
  },
  updateNextPassiveDownloadTime: {
    prepare: nextDownloadTime => ({ payload: { nextDownloadTime } }),
    reducer: (draftState, { payload: { nextDownloadTime } }) => {
      draftState.nextPassiveDownloadTime = nextDownloadTime;
    },
  },
  downloadTemperaturesForSensor: {
    prepare: (sensorId, isPassive = false) => ({ payload: { sensorId, isPassive } }),
    reducer: () => {},
  },
};

const { actions: TemperatureDownloadAction, reducer: TemperatureDownloadReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER_SHAPE.TEMPERATURE_DOWNLOAD,
});

function* downloadTemperaturesForSensor({ payload: { sensorId, isPassive } }) {
  const getServices = yield getContext('getServices');
  const [btService, sensorManager, TemperatureDownloadManager] = yield call(getServices, [
    SERVICES.BLUETOOTH,
    SERVICES.SENSOR_MANAGER,
    SERVICES.TEMPERATURE_DOWNLOAD_MANAGER,
  ]);
  const sensor = yield call(sensorManager.getSensorById, sensorId);
  try {
    const [canDownload] = yield call(sensorManager.getCanDownload, sensorId);

    if (canDownload) {
      yield put(SensorAction.toggleDownloading(sensorId, true));

      const { macAddress, logInterval } = sensor;
      const logs = yield call(btService.downloadLogsWithRetries, macAddress, 10);
      const mostRecentLogTime = yield call(sensorManager.getMostRecentLogTime, sensorId);
      const numberOfLogsToSave = yield call(
        TemperatureDownloadManager.calculateNumberOfLogsToSave,
        mostRecentLogTime,
        logInterval
      );

      const sensorLogs = yield call(
        TemperatureDownloadManager.createLogs,
        logs,
        sensor,
        numberOfLogsToSave
      );

      yield call(TemperatureDownloadManager.saveLogs, sensorLogs);
      yield put(BreachAction.createBreaches(sensor));
    } else {
      ToastAndroid.show(`Cannot download logs yet!`, ToastAndroid.SHORT);
    }
  } catch (error) {
    if (!isPassive) {
      ToastAndroid.show(
        `Could not download temperatures for ${sensor.name ?? sensor.macAddress}`,
        ToastAndroid.SHORT
      );
    }
  }
  yield put(SensorAction.toggleDownloading(sensorId, false));
}

function* downloadTemperatures() {
  const getServices = yield getContext('getService');
  const sensorManager = yield call(getServices, SERVICES.SENSOR_MANAGER);

  try {
    const sensors = yield call(sensorManager.getSensors);
    const mapper = ({ id }) =>
      put(TemperatureDownloadAction.downloadTemperaturesForSensor(id, false));
    const actions = sensors.map(mapper);
    yield all(actions);
  } catch (error) {
    console.log('-------------------------------------------');
    console.log('error', error.message);
    console.log('-------------------------------------------');
  }
}

function* stopPassiveDownloading() {
  yield take(TemperatureDownloadAction.stopPassiveDownloading);
}

function* startPassiveDownloading() {
  const getServices = yield getContext('getService');
  const settingManager = yield call(getServices, SERVICES.SETTING_MANAGER);
  const downloadIntervalSetting = yield call(
    settingManager.getSetting,
    SETTING.INT.DOWNLOAD_INTERVAL
  );

  const downloadInterval = JSON.parse(downloadIntervalSetting.value);

  while (true) {
    yield delay(__DEV__ ? 60000 : downloadInterval);
    yield call(downloadTemperatures);
  }
}

function* watchPassiveDownloading() {
  yield take(TemperatureDownloadAction.startPassiveDownloading);
  yield race({ start: call(startPassiveDownloading), stop: call(stopPassiveDownloading) });
}

function* watchTemperatureDownloadActions() {
  yield takeEvery(
    TemperatureDownloadAction.downloadTemperaturesForSensor,
    downloadTemperaturesForSensor
  );
  yield fork(watchPassiveDownloading);
}

const TemperatureDownloadSaga = {
  watchTemperatureDownloadActions,
  downloadTemperaturesForSensor,
};
const TemperatureDownloadSelector = {};

export {
  TemperatureDownloadAction,
  TemperatureDownloadReducer,
  TemperatureDownloadSaga,
  TemperatureDownloadSelector,
};
