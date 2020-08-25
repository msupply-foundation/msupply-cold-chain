import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { SensorSaga } from '~sensor';
import { BreachConfigurationSaga } from '~breachConfiguration';
import { SettingSaga } from '~setting';
import { WatchDatabaseActions } from '~database';
import { BluetoothServiceWatcher } from '~bluetooth';
import { getService, getServices } from '~services';

export function* RootSaga() {
  yield fork(BluetoothServiceWatcher);
  yield fork(WatchDatabaseActions);
  yield fork(SensorSaga.watchSensorActions);
  yield fork(SettingSaga.WatchSettingActions);
  yield fork(BreachConfigurationSaga.watchBreachConfigurationActions);
}

export const SagaMiddleware = createSagaMiddleware({
  context: { getService, getServices },
});
