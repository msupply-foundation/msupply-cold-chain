import { SagaIterator } from '@redux-saga/types';
import { actionChannel, fork, take, call, all, put, select, takeEvery } from 'redux-saga/effects';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SensorState } from '../../Entities/Sensor/SensorSlice';
import { MILLISECONDS, REDUCER } from '~constants';
import { SensorAction, SensorManager } from '~features/Entities';
import { getDependency } from '~features/utils/saga';
import { BleService } from '@openmsupply/msupply-ble-service';
import { isSensorDownloading } from '../Download/DownloadSlice';
import { RootState } from '~common/store';

const INFO_RETRIES = 2;

interface BatteryObserverState {
  nextUpdateTime: number;
  updatingById: Record<string, boolean>;
}

export const BatteryObserverInitialState: BatteryObserverState = {
  nextUpdateTime: Date.now(),
  updatingById: {},
};

interface BatteryUpdatePayload {
  sensorId: string;
}
interface NextUpdateTimePayload {
  nextUpdateTime: number;
}

export const isSensorUpdating =
  (sensorId: string) =>
  (state: RootState): boolean => {
    try {
      return state.bluetooth.batteryObserver.updatingById[sensorId] || false;
    } catch {
      return false;
    }
  };

const reducers = {
  setNextUpdateTime: {
    prepare: (nextUpdateTime: number) => ({ payload: { nextUpdateTime } }),
    reducer: (
      draftState: BatteryObserverState,
      { payload: { nextUpdateTime } }: PayloadAction<NextUpdateTimePayload>
    ) => {
      draftState.nextUpdateTime = nextUpdateTime;
    },
  },
  updateBatteryLevels: () => {},
  updateStart: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: BatteryObserverState,
      { payload: { sensorId } }: PayloadAction<BatteryUpdatePayload>
    ) => {
      draftState.updatingById[sensorId] = true;
    },
  },
  updateComplete: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: BatteryObserverState,
      { payload: { sensorId } }: PayloadAction<BatteryUpdatePayload>
    ) => {
      draftState.updatingById[sensorId] = false;
    },
  },

  updateSuccess: {
    prepare: (macAddress: string, batteryLevel: string) => ({
      payload: { macAddress, batteryLevel },
    }),
    reducer: () => {},
  },

  updateFail: {
    prepare: (macAddress: string, errorMessage: string) => ({
      payload: { macAddress, errorMessage },
    }),
    reducer: () => {},
  },
  tryUpdateBatteryForSensor: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: () => {},
  },
};

const { actions: BatteryObserverAction, reducer: BatteryObserverReducer } = createSlice({
  initialState: BatteryObserverInitialState,
  name: REDUCER.BATTERY_OBSERVER,
  reducers,
});

const BatteryObserverSelector = {};

function* tryBatteryUpdateForSensor({
  payload: { sensorId },
}: PayloadAction<BatteryUpdatePayload>): SagaIterator {
  const btService: BleService = yield call(getDependency, 'bleService');
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');
  const { macAddress } = yield call(sensorManager.getSensorById, sensorId);

  const isDownloading = yield select(isSensorDownloading(sensorId));
  if (!isDownloading) {
    try {
      yield put(BatteryObserverAction.updateStart(sensorId));

      const { batteryLevel } = yield call(
        btService.getInfoWithRetries,
        macAddress,
        INFO_RETRIES,
        null
      );

      if (batteryLevel !== null) {
        console.log(`BleService battery ${macAddress} ${batteryLevel}`);
        yield put(SensorAction.update(sensorId, 'batteryLevel', batteryLevel));
        yield put(BatteryObserverAction.updateSuccess(macAddress, batteryLevel));
      } else {
        yield put(BatteryObserverAction.updateFail(macAddress, 'battery Level null'));
      }
    } catch (error) {
      yield put(
        BatteryObserverAction.updateFail(macAddress, error ? error.toString() : 'fail: no message')
      );
    }
    yield put(BatteryObserverAction.updateComplete(sensorId));
  }
}

function* updateBatteryLevels(): SagaIterator {
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');
  try {
    const sensors: SensorState[] = yield call(sensorManager.getAll);
    const mapper = ({ id }: SensorState) =>
      put(BatteryObserverAction.tryUpdateBatteryForSensor(id));
    const actions = sensors.map(mapper);
    yield all(actions);
  } catch (_) {}
}

function* tryUpdateBatteryLevels(): SagaIterator {
  const { nextUpdateTime } = yield select((state: RootState) => state.bluetooth.batteryObserver);
  if (nextUpdateTime > Date.now()) return;

  yield call(updateBatteryLevels);
  yield put(BatteryObserverAction.setNextUpdateTime(Date.now() + MILLISECONDS.TEN_MINUTES));
}
function* queueBatteryUpdates(): SagaIterator {
  const channel = yield actionChannel(BatteryObserverAction.tryUpdateBatteryForSensor);

  while (true) {
    const action = yield take(channel);
    yield call(tryBatteryUpdateForSensor, action);
  }
}

function* root(): SagaIterator {
  yield takeEvery(BatteryObserverAction.updateBatteryLevels, tryUpdateBatteryLevels);
  yield fork(queueBatteryUpdates);
}

const BatteryObserverSaga = { root, tryUpdateBatteryLevels, updateBatteryLevels };

export {
  BatteryObserverAction,
  BatteryObserverReducer,
  BatteryObserverSaga,
  BatteryObserverSelector,
};
