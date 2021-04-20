import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  call,
  getContext,
  put,
  takeEvery,
  take,
  race,
  all,
  delay,
  takeLeading,
} from 'redux-saga/effects';
import { SensorState } from '../../Entities/Sensor/SensorSlice';
import { MILLISECONDS, DEPENDENCY, REDUCER } from '../../../common/constants';
import { CumulativeBreachAction, ConsecutiveBreachAction } from '../../Breach';

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
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [btService, sensorManager, downloadManager] = yield call(DependencyLocator.get, [
    DEPENDENCY.BLUETOOTH,
    DEPENDENCY.SENSOR_MANAGER,
    DEPENDENCY.DOWNLOAD_MANAGER,
  ]);

  const sensor = yield call(sensorManager.getSensorById, sensorId);

  try {
    const [canDownload] = yield call(sensorManager.getCanDownload, sensorId);

    if (canDownload) {
      yield put(DownloadAction.downloadStart(sensorId));

      const { macAddress, logInterval, logDelay, programmedDate } = sensor;
      const logs = yield call(btService.downloadLogsWithRetries, macAddress, 10);
      const mostRecentLogTime = yield call(sensorManager.getMostRecentLogTime, sensorId);

      const numberOfLogsToSave = yield call(
        downloadManager.calculateNumberOfLogsToSave,
        Math.max(mostRecentLogTime + logInterval, logDelay, programmedDate),
        logInterval
      );

      const sensorLogs = yield call(
        downloadManager.createLogs,
        logs,
        sensor,
        numberOfLogsToSave,
        mostRecentLogTime
      );

      yield call(downloadManager.saveLogs, sensorLogs);
      if (numberOfLogsToSave) {
        yield call(btService.updateLogIntervalWithRetries, macAddress, logInterval, 10);
      }
      yield put(ConsecutiveBreachAction.create(sensor));
      yield put(DownloadAction.passiveDownloadForSensorSuccess(sensor.id));
      yield put(CumulativeBreachAction.fetchListForSensor(sensorId));
    } else {
      yield put(DownloadAction.passiveDownloadForSensorFail(sensor.id));
    }
  } catch (error) {
    yield put(DownloadAction.passiveDownloadForSensorFail(error.message));
  }

  yield put(DownloadAction.downloadComplete(sensorId));
}

function* downloadTemperatures(): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);

  try {
    const sensors = yield call(sensorManager.getSensors);
    const mapper = ({ id }: SensorState) => put(DownloadAction.tryPassiveDownloadForSensor(id));
    const actions = (sensors as SensorState[]).map(mapper);
    yield all(actions);
    // eslint-disable-next-line no-empty
  } catch (error) {}
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

function* root(): SagaIterator {
  yield takeEvery(DownloadAction.tryManualDownloadForSensor, tryDownloadForSensor);
  yield takeEvery(DownloadAction.tryPassiveDownloadForSensor, tryDownloadForSensor);
  yield takeLeading(DownloadAction.passiveDownloadingStart, watchPassiveDownloading);
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
