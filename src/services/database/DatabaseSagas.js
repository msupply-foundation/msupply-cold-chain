import { put, call, getContext, takeLeading } from 'redux-saga/effects';
import { SERVICES } from '~constants';
import { SensorsActions, TemperatureLogActions } from './DatabaseSlice';

export function* createBreaches(action) {
  const { payload } = action;
  const { macAddress } = payload;

  const getService = yield getContext('getService');
  const dbService = yield call(getService, SERVICES.DATABASE);

  const { createdBreaches, endedBreaches } = yield call(dbService.createBreaches, macAddress);

  yield put(TemperatureLogActions.savedBreaches(createdBreaches, endedBreaches));
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

  yield call(dbService.saveSensorLogs, data, macAddress);

  yield put(TemperatureLogActions.createTemperatureLogs(macAddress));
}

export function* WatchDatabaseActions() {
  yield takeLeading(SensorsActions.saveSensors, saveSensors);
  yield takeLeading(TemperatureLogActions.saveSensorLogs, saveSensorLogs);
  yield takeLeading(TemperatureLogActions.createTemperatureLogs, createTemperatureLogs);
  yield takeLeading(TemperatureLogActions.createBreaches, createBreaches);
}
