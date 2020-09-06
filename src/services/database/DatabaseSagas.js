import { Alert, ToastAndroid } from 'react-native';
import { put, call, getContext, takeEvery } from 'redux-saga/effects';

import moment from 'moment';

import { uuid } from '~services/utilities';
import { ENTITIES, SERVICES } from '~constants';
import { SensorsActions, TemperatureLogActions } from './DatabaseSlice';

const getData = (n = 140, sensorId) => {
  const date = moment().subtract(30 * n, 'minutes');

  const getTemperature = () => Number((Math.random() * 10).toFixed(2));

  return Array.from({ length: n }).map((_, i) => ({
    id: uuid(),
    timestamp: moment(date)
      .add(30 * i, 'minutes')
      .unix(),
    temperature: getTemperature(),
    sensorId,
    logInterval: 300,
  }));
};

export function* createBreaches(action) {
  console.log('-------------------------------------------');
  console.log('create breaches');
  console.log('-------------------------------------------');
  const { payload } = action;
  const { macAddress } = payload;

  const getService = yield getContext('getService');
  const dbService = yield call(getService, SERVICES.DATABASE);
  const dbUtils = yield call(getService, SERVICES.DATABASE_UTILS);

  const x = yield call(dbService.getSensor, macAddress);
  try {
    const [sensor] = x;
    const breach = yield call(dbService.getMostRecentBreach, sensor);
    const time = yield call(dbService.getMostRecentBreachedLog, sensor);
    const logs = yield call(dbService.getTemperatureLogs, sensor, new Date(time + 1));

    const configs = yield call(dbService.getConfigs);

    const [uBreaches, tempLogs] = yield call(dbUtils.cBreaches, sensor, logs, configs, breach);

    yield call(dbService.updateBreaches, uBreaches, tempLogs);
  } catch (error) {
    console.log('-------------------------------------------');
    console.log('error', error.message);
    console.log('-------------------------------------------');
  }
}

export function* createTemperatureLogs(action) {
  console.log('-------------------------------------------');
  console.log('create temperature logs');
  console.log('-------------------------------------------');
  const { payload } = action;
  const { macAddress } = payload;

  try {
    const getService = yield getContext('getService');
    const dbService = yield call(getService, SERVICES.DATABASE);

    const createdTemperatureLogs = yield call(dbService.createTemperatureLogs, macAddress);

    yield put(TemperatureLogActions.savedTemperatureLogs(macAddress, createdTemperatureLogs));
    yield put(TemperatureLogActions.createBreaches(macAddress));
  } catch (error) {
    console.log('-------------------------------------------');
    console.log('error', error.message);
    console.log('-------------------------------------------');
  }
}

export function* saveSensors(action) {
  const { payload } = action;
  const { sensors } = payload;

  const getService = yield getContext('getService');
  const dbService = yield call(getService, SERVICES.DATABASE);

  const savedSensors = yield call(dbService.saveSensors, sensors);

  yield put(SensorsActions.setSensors(savedSensors));
}

export function* saveSensorLogs(action) {
  const { payload } = action;
  const { data, macAddress } = payload;

  try {
    const getService = yield getContext('getService');
    const dbService = yield call(getService, SERVICES.DATABASE);
    const sensorManager = yield call(getService, SERVICES.SENSOR_MANAGER);
    const dbUtils = yield call(getService, SERVICES.DATABASE_UTILS);

    const [sensor] = yield call(dbService.getSensor, macAddress);
    const mostRecentLogTime = yield call(dbService.mostRecentTimestamp, sensor);
    let numberToSave = data.length;
    if (mostRecentLogTime) {
      numberToSave = yield call(
        dbUtils.calculateNumberOfLogsToSave,
        mostRecentLogTime ?? new Date(),
        sensor.logInterval
      );
    }

    const mapped = yield call(dbUtils.createSensorLogs, data, { ...sensor }, numberToSave);

    yield call(dbService.saveSensorLogs, mapped);
    yield call(sensorManager.updateLastDownloadTime, sensor);

    yield put(TemperatureLogActions.createTemperatureLogs(macAddress));
  } catch (error) {
    console.log('-------------------------------------------');
    console.log('error', error.message);
    console.log('-------------------------------------------');
  }
}

function* addRandomLogs({ payload: { id } }) {
  const getService = yield getContext('getService');
  const dbService = yield call(getService, SERVICES.DATABASE);
  try {
    const data = getData(1440, id);

    yield dbService.upsert(ENTITIES.TEMPERATURE_LOG, data);

    ToastAndroid.show(`Saved logs ${data.length}`, ToastAndroid.LONG);
  } catch (e) {
    Alert.alert(e.toString());
    ToastAndroid.show(`Saved logs error ${e.toString()}`, ToastAndroid.LONG);
  }
}

export function* WatchDatabaseActions() {
  yield takeEvery(SensorsActions.saveSensors, saveSensors);
  yield takeEvery(TemperatureLogActions.saveSensorLogs, saveSensorLogs);
  yield takeEvery(TemperatureLogActions.createTemperatureLogs, createTemperatureLogs);
  yield takeEvery(TemperatureLogActions.createBreaches, createBreaches);
  yield takeEvery(TemperatureLogActions.addRandomLogs, addRandomLogs);
}
