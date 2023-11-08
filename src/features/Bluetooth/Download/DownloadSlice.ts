import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  call,
  put,
  takeEvery,
  take,
  race,
  all,
  delay,
  takeLeading,
  actionChannel,
  fork,
  select,
} from 'redux-saga/effects';
import { getDependency } from '~features/utils/saga';
import { SensorState } from '~features/Entities/Sensor/SensorSlice';
import { BleService } from 'msupply-ble-service';
import { MILLISECONDS, REDUCER } from '~common/constants';
import {
  DownloadManager,
  SensorManager,
  CumulativeBreachAction,
  ConsecutiveBreachAction,
} from '~features';
import { FileLoggerService } from '~common/services';
import { RootState } from '~common/store';
import { isSensorUpdating } from '../BatteryObserver/BatteryObserverSlice';

const DOWNLOAD_RETRIES = 3;
interface DownloadSliceState {
  downloadingById: Record<string, boolean>;
  passiveDownloadEnabled: boolean;
  enabled: boolean;
}

export const DownloadInitialState: DownloadSliceState = {
  downloadingById: {},
  passiveDownloadEnabled: false,
  enabled: false,
};

interface DownloadStartPayload {
  sensorId: string;
}

export const isSensorDownloading =
  (sensorId: string) =>
  (state: RootState): boolean => {
    try {
      return state.bluetooth.download.downloadingById[sensorId] || false;
    } catch {
      return false;
    }
  };

const reducers = {
  passiveDownloadingStart: (draftState: DownloadSliceState) => {
    draftState.enabled = true;
  },
  passiveDownloadingStop: (draftState: DownloadSliceState) => {
    draftState.enabled = false;
  },
  downloadStart: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: DownloadSliceState,
      { payload: { sensorId } }: PayloadAction<DownloadStartPayload>
    ) => {
      draftState.downloadingById[sensorId] = true;
    },
  },
  downloadComplete: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: DownloadSliceState,
      { payload: { sensorId } }: PayloadAction<DownloadStartPayload>
    ) => {
      draftState.downloadingById[sensorId] = false;
    },
  },
  tryManualDownloadForSensor: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: () => {},
  },
  manualDownloadForSensorSuccess: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: () => {},
  },
  manualDownloadForSensorFail: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: () => {},
  },
  tryPassiveDownloadForSensor: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: () => {},
  },
  passiveDownloadForSensorSuccess: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: () => {},
  },
  passiveDownloadForSensorFail: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: () => {},
  },
};

const { actions: DownloadAction, reducer: DownloadReducer } = createSlice({
  initialState: DownloadInitialState,
  reducers,
  name: REDUCER.DOWNLOAD,
});

function* tryDownloadForSensor({
  payload: { sensorId },
}: PayloadAction<DownloadStartPayload>): SagaIterator {
  const btService: BleService = yield call(getDependency, 'bleService');
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');
  const downloadManager: DownloadManager = yield call(getDependency, 'downloadManager');
  const logger: FileLoggerService = yield call(getDependency, 'loggerService');

  try {
    const sensor = yield call(sensorManager.getSensorById, sensorId);
    const [canDownload] = yield call(sensorManager.getCanDownload, sensorId);
    const isDownloading = yield select(isSensorDownloading(sensorId));
    const isUpdating = yield select(isSensorUpdating(sensorId));

    const doDownload = canDownload && !isDownloading && !isUpdating;

    logger.debug(
      `${sensorId} tryDownloadForSensor canDownload: ${canDownload} isDownloading: ${isDownloading} isUpdating: ${isUpdating} doDownload: ${doDownload}`
    );
    if (doDownload) {
      yield put(DownloadAction.downloadStart(sensorId));

      const { macAddress, logInterval, logDelay, programmedDate } = sensor;

      const mostRecentLogTime = yield call(sensorManager.getMostRecentLogTime, sensorId);

      const numberOfLogsToSave = yield call(
        downloadManager.calculateNumberOfLogsToSave,
        Math.max(mostRecentLogTime + logInterval, logDelay, programmedDate),
        logInterval
      );
      if (!numberOfLogsToSave) return logger.debug(`${sensorId} No logs to save`);
      logger.debug(`${sensorId} ${numberOfLogsToSave} logs to save`);

      const logs = yield call(
        btService.downloadLogsWithRetries,
        macAddress,
        DOWNLOAD_RETRIES,
        null
      );
      logger.info(`${sensorId} logs downloaded: ${logs.length}`);

      const sensorLogs = yield call(
        downloadManager.createLogs,
        logs,
        sensor,
        Math.min(numberOfLogsToSave, logs?.length),
        mostRecentLogTime
      );

      yield call(downloadManager.saveLogs, sensorLogs);
      if (sensorLogs.length) {
        yield call(
          btService.updateLogIntervalWithRetries,
          macAddress,
          logInterval,
          10,
          false,
          null
        );
      }
      yield put(ConsecutiveBreachAction.create(sensor));
      yield put(DownloadAction.passiveDownloadForSensorSuccess(sensor.id));
      yield put(CumulativeBreachAction.fetchListForSensor(sensorId));
    } else {
      yield put(DownloadAction.passiveDownloadForSensorFail(sensor.id));
    }
  } catch (error) {
    logger.error(`${sensorId} Error in tryDownloadForSensor: ${(error as Error)?.message}`);
    yield put(DownloadAction.passiveDownloadForSensorFail((error as Error)?.message));
  }

  yield put(DownloadAction.downloadComplete(sensorId));
}

function* downloadTemperatures(): SagaIterator {
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');

  try {
    const sensors: SensorState[] = yield call(sensorManager.getAll);
    const mapper = ({ id }: SensorState) => put(DownloadAction.tryPassiveDownloadForSensor(id));
    const actions = sensors.map(mapper);
    yield all(actions);
  } catch (error) {
    // This shouldn't happen as we are catching errors in tryDownloadForSensor
    console.error(`Error in downloadTemperatures: ${(error as Error)?.message}`);
  }
}

function* startPassiveDownloading(): SagaIterator {
  while (true) {
    yield call(downloadTemperatures);
    yield delay(MILLISECONDS.SIXTY_SECONDS);
  }
}

function* watchPassiveDownloading(): SagaIterator {
  yield race({
    start: call(startPassiveDownloading),
    stop: take(DownloadAction.passiveDownloadingStop),
  });
}

function* queuePassiveDownloads(): SagaIterator {
  const channel = yield actionChannel(DownloadAction.tryPassiveDownloadForSensor);

  while (true) {
    const action = yield take(channel);
    yield call(tryDownloadForSensor, action);
  }
}

function* root(): SagaIterator {
  yield takeEvery(DownloadAction.tryManualDownloadForSensor, tryDownloadForSensor);
  yield takeLeading(DownloadAction.passiveDownloadingStart, watchPassiveDownloading);
  yield fork(queuePassiveDownloads);
}

const DownloadSaga = {
  root,
  watchPassiveDownloading,
  startPassiveDownloading,
  downloadTemperatures,
  tryDownloadForSensor,
};
const DownloadSelector = {};

export { DownloadAction, DownloadReducer, DownloadSaga, DownloadSelector };
