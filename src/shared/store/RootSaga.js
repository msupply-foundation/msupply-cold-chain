import createSagaMiddleware from 'redux-saga';
import { spawn } from 'redux-saga/effects';

import { BluetoothServiceSaga } from '~bluetooth';

export function* RootSaga() {
  yield spawn(BluetoothServiceSaga);
}

export const SagaMiddleware = createSagaMiddleware();
