import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { BluetoothServiceWatcher } from '~bluetooth';
import { getService } from '~services';

export function* X() {
  yield fork(BluetoothServiceWatcher);
}

export function* RootSaga() {
  yield fork(BluetoothServiceWatcher);
}

export const SagaMiddleware = createSagaMiddleware({
  context: { getService },
});
