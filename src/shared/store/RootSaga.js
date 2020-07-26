import { spawn, createSagaMiddleware } from 'redux-saga';

import { BluetoothServiceSaga } from '~bluetooth';

export function* RootSaga() {
  yield spawn(BluetoothServiceSaga);
}

export const SagaMiddleware = createSagaMiddleware();
