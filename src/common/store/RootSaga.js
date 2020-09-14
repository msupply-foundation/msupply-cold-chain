import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { SettingSaga, BreachConfigurationSaga, SensorSaga } from '~features/Entities';
import { DependencyLocator } from '~services';
import { ChartSaga } from '../../features/Chart';
import { BreachSaga } from '../../features/Breach';
import { LogTableSaga } from '../../features/LogTable';
import { BluetoothSaga } from '../../features/Bluetooth';
import { ReportSaga } from '../../features/Report';
import { SensorStatusSaga } from '../../features/SensorStatus';
import { PermissionSaga } from '~features/Permission';

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
  yield fork(PermissionSaga.root);
}

export const SagaMiddleware = createSagaMiddleware({
  context: { DependencyLocator },
});
