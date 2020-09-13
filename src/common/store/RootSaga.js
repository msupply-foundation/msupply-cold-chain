import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { SensorSaga } from '~sensor';
import { BreachConfigurationSaga } from '~breachConfiguration';
import { SettingSaga } from '~setting';
import { DependencyLocator } from '~services';
import { ChartSaga } from '../../features/chart';
import { BreachSaga } from '../../features/breach';
import { LogTableSaga } from '../../features/logTable';
import { BluetoothSaga } from '../../features/bluetooth';
import { ReportSaga } from '../../features/Report';
import { SensorStatusSaga } from '../../features/SensorStatus';

export function* RootSaga() {
  yield fork(SensorSaga.watchSensorActions);
  yield fork(SettingSaga.watchSettingActions);
  yield fork(BreachConfigurationSaga.watchBreachConfigurationActions);
  yield fork(ChartSaga.watchChartActions);
  yield fork(BreachSaga.watchBreachActions);
  yield fork(LogTableSaga.watchLogTableActions);
  yield fork(BluetoothSaga.root);
  yield fork(ReportSaga.root);
  yield fork(SensorStatusSaga.root);
}

export const SagaMiddleware = createSagaMiddleware({
  context: { DependencyLocator },
});
