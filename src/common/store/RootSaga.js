import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { EntitiesSaga } from '~features/Entities';
import { DependencyLocator } from '~services';
import { ChartSaga } from '../../features/Chart';
import { BreachSaga } from '../../features/Breach';
import { SensorDetailSaga } from '~features/SensorDetail';
import { BluetoothSaga } from '../../features/Bluetooth';
import { ReportSaga } from '../../features/Report';
import { SensorStatusSaga } from '../../features/SensorStatus';
import { PermissionSaga } from '~features/Permission';

export function* RootSaga() {
  yield fork(EntitiesSaga.root);
  yield fork(ChartSaga.watchChartActions);
  yield fork(BreachSaga.root);
  yield fork(SensorDetailSaga.root);
  yield fork(BluetoothSaga.root);
  yield fork(ReportSaga.root);
  yield fork(SensorStatusSaga.root);
  yield fork(PermissionSaga.root);
}

export const SagaMiddleware = createSagaMiddleware({
  context: { DependencyLocator },
});
