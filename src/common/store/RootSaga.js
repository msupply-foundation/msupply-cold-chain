import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { SensorSaga } from '~sensor';
import { BreachConfigurationSaga } from '~breachConfiguration';
import { SettingSaga } from '~setting';
import { WatchDatabaseActions } from '~database';
import { BluetoothServiceWatcher } from '~bluetooth';
import { getService, getServices } from '~services';
import { ChartSaga } from '../../features/chart';
import { BreachSaga } from '../../features/breach';
import { DeviceSaga } from '../../services/device';
import { LogTableSaga } from '../../features/logTable';
import { TemperatureDownloadSaga } from '../../features/temperatureDownload';

export function* RootSaga() {
  yield fork(BluetoothServiceWatcher);
  yield fork(WatchDatabaseActions);
  yield fork(SensorSaga.watchSensorActions);
  yield fork(SettingSaga.watchSettingActions);
  yield fork(BreachConfigurationSaga.watchBreachConfigurationActions);
  yield fork(ChartSaga.watchChartActions);
  yield fork(BreachSaga.watchBreachActions);
  yield fork(DeviceSaga.watchDeviceActions);
  yield fork(LogTableSaga.watchLogTableActions);
  yield fork(TemperatureDownloadSaga.watchTemperatureDownloadActions);
}

export const SagaMiddleware = createSagaMiddleware({
  context: { getService, getServices },
});
