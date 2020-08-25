import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { SensorSaga } from '~sensor';
import { BreachConfigurationSaga } from '~breachConfiguration';
import { SettingSaga } from '~setting';
import { WatchDatabaseActions } from '~database';
import { BluetoothServiceWatcher } from '~bluetooth';
import { getService, getServices } from '~services';
import { TemperatureLogSaga } from '~temperatureLog';

export function* RootSaga() {
  yield fork(BluetoothServiceWatcher);
  yield fork(WatchDatabaseActions);
  yield fork(SensorSaga.watchSensorActions);
  yield fork(SettingSaga.watchSettingActions);
  yield fork(BreachConfigurationSaga.watchBreachConfigurationActions);
  yield fork(TemperatureLogSaga.watchTemperatureLogActions);
}

export const SagaMiddleware = createSagaMiddleware({
  context: { getService, getServices },
});
