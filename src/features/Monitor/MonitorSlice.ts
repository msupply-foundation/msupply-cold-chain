import Bugsnag from '@bugsnag/react-native';
import { SagaIterator } from '@redux-saga/types';
import { createSlice } from '@reduxjs/toolkit';
import { BleService } from 'msupply-ble-service';
import { BleManager } from 'react-native-ble-plx';
import { call, delay, select, takeLeading } from 'redux-saga/effects';
import { DependencyLocator } from '~common/services';
import {
  DEPENDENCY,
  ENVIRONMENT,
  MILLISECONDS,
  REDUCER,
  RESTART_INTERVAL_IN_SECONDS,
} from '~constants';
import { getIsDownloading } from '~features/Bluetooth/Download/DownloadSlice';

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
  const utilService = yield call(DependencyLocator.get, DEPENDENCY.UTIL_SERVICE);
  let start = utilService.now();

  while (true) {
    yield delay(MILLISECONDS.SIXTY_SECONDS);

    const now = utilService.now();

    if (!ENVIRONMENT.MOCK_BLE) {
      if (now - start >= RESTART_INTERVAL_IN_SECONDS) {
        start = now;
        try {
          // Don't restart if we are downloading
          const isDownloading = yield select(getIsDownloading);

          if (!isDownloading) {
            Bugsnag.leaveBreadcrumb('Restarting bluetooth service');
            restartBluetoothService();
          } else {
            Bugsnag.leaveBreadcrumb('Skipping bluetooth restart because we are downloading');
          }
        } catch (e) {
          Bugsnag.notify(e);
          console.log(e);
        }
      }
    }
  }
}

function restartBluetoothService() {
  const loggerService = DependencyLocator.get(DEPENDENCY.LOGGER_SERVICE);
  loggerService.info('Restarting bluetooth service');
  DependencyLocator.register('bleService', undefined);
  DependencyLocator.register('bleService', new BleService(new BleManager(), loggerService));
}

function* root(): SagaIterator {
  yield takeLeading(MonitorAction.start, startDependencyMonitor);
}

const MonitorSaga = { root, startDependencyMonitor };

export { MonitorAction, MonitorReducer, MonitorSaga, MonitorSelector };
