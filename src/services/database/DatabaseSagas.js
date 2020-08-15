import { put, call, getContext, takeLeading } from 'redux-saga/effects';
import { SERVICES } from '~constants';
import { SensorsActions, TemperatureLogActions } from './DatabaseSlice';

export function* createBreaches(action) {
  const { payload } = action;
  const { macAddress } = payload;

  const getService = yield getContext('getService');
  const dbService = yield call(getService, SERVICES.DATABASE);
  const dbUtils = yield call(getService, SERVICES.DATABASE_UTILS);

  const x = yield call(dbService.getSensor, macAddress);
  const [sensor] = x;
  const breach = yield call(dbService.getMostRecentBreach, sensor);
  const time = yield call(dbService.getMostRecentBreachedLog, sensor);
  const logs = yield call(dbService.getTemperatureLogs, sensor, new Date(time + 1));

  const configs = yield call(dbService.getConfigs);

  const [uBreaches, tempLogs] = yield call(dbUtils.cBreaches, sensor, logs, configs, breach);

  yield call(dbService.updateBreaches, uBreaches, tempLogs);
}

export function* createTemperatureLogs(action) {
  const { payload } = action;
  const { macAddress } = payload;

  const getService = yield getContext('getService');
  const dbService = yield call(getService, SERVICES.DATABASE);

  const createdTemperatureLogs = yield call(dbService.createTemperatureLogs, macAddress);

  yield put(TemperatureLogActions.savedTemperatureLogs(macAddress, createdTemperatureLogs));
  yield put(TemperatureLogActions.createBreaches(macAddress));
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

  const getService = yield getContext('getService');
  const dbService = yield call(getService, SERVICES.DATABASE);
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

  yield put(TemperatureLogActions.createTemperatureLogs(macAddress));
}

export function* WatchDatabaseActions() {
  yield takeLeading(SensorsActions.saveSensors, saveSensors);
  yield takeLeading(TemperatureLogActions.saveSensorLogs, saveSensorLogs);
  yield takeLeading(TemperatureLogActions.createTemperatureLogs, createTemperatureLogs);
  yield takeLeading(TemperatureLogActions.createBreaches, createBreaches);
}
