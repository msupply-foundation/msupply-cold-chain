import Bugsnag from '@bugsnag/react-native';
import { SagaIterator } from '@redux-saga/types';
import { createSlice } from '@reduxjs/toolkit';
import { BleService } from 'msupply-ble-service';
import { BleManager } from 'react-native-ble-plx';
import { call, delay, takeLeading } from 'redux-saga/effects';
import { DependencyLocator } from '~common/services';
import {
  DEPENDENCY,
  ENVIRONMENT,
  MILLISECONDS,
  REDUCER,
  RESTART_INTERVAL_IN_SECONDS,
} from '~constants';

interface MonitorState {
  isWatching: boolean;
}

export const MonitorInitialState: MonitorState = {
  isWatching: false,
};

const reducers = {
  start: (draftState: MonitorState) => {
    draftState.isWatching = true;
  },
  stop: (draftState: MonitorState) => {
    draftState.isWatching = false;
  },
};

const { actions: MonitorAction, reducer: MonitorReducer } = createSlice({
  initialState: MonitorInitialState,
  name: REDUCER.MONITOR,
  reducers,
});

const MonitorSelector = {};

function* startDependencyMonitor(): SagaIterator {
  if (ENVIRONMENT.MOCK_BLE) return;

  const utilService = yield call(DependencyLocator.get, DEPENDENCY.UTIL_SERVICE);
  let start = utilService.now();

  while (true) {
    const now = utilService.now();

    if (now - start >= RESTART_INTERVAL_IN_SECONDS) {
      const loggerService = yield call(DependencyLocator.get, DEPENDENCY.LOGGER_SERVICE);
      loggerService.info('Restarting bluetooth service');
      Bugsnag.leaveBreadcrumb('Restarting bluetooth service');
      start = now;
      DependencyLocator.register('bleService', undefined);
      DependencyLocator.register('bleService', new BleService(new BleManager(), loggerService));
    }

    yield delay(MILLISECONDS.SIXTY_SECONDS);
  }
}

function* root(): SagaIterator {
  yield takeLeading(MonitorAction.start, startDependencyMonitor);
}

const MonitorSaga = { root, startDependencyMonitor };

export { MonitorAction, MonitorReducer, MonitorSaga, MonitorSelector };
