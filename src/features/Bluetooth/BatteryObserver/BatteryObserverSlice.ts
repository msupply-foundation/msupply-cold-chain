import { SagaIterator } from '@redux-saga/types';
import { NativeModules } from 'react-native';
import { take, delay, getContext, call, all, put, takeLeading, race } from 'redux-saga/effects';
import { createSlice } from '@reduxjs/toolkit';
import { SensorState } from '../../Entities/Sensor/SensorSlice';
import { DEPENDENCY, REDUCER, MILLISECONDS } from '~constants';
import { SensorAction } from '~features/Entities';

interface BatteryObserverState {
  isWatching: boolean;
}

export const BatteryObserverInitialState: BatteryObserverState = {
  isWatching: false,
};

const reducers = {
  start: (draftState: BatteryObserverState) => {
    draftState.isWatching = true;
  },
  stop: (draftState: BatteryObserverState) => {
    draftState.isWatching = false;
  },
  updateSuccess: () => {},
  updateFail: () => {},
};

const { actions: BatteryObserverAction, reducer: BatteryObserverReducer } = createSlice({
  initialState: BatteryObserverInitialState,
  name: REDUCER.BATTERY_OBSERVER,
  reducers,
});

const BatteryObserverSelector = {};

function* updateBatteryLevels(): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);

  try {
    const { data, success } = yield call(NativeModules.SussolBleManager.getDevices, 307, '');
    if (success) {
      const sensors = yield call(sensorManager.getAll);
      const mapped = sensors.map((sensor: SensorState) => {
        const { batteryLevel } =
          (data as SensorState[]).find(adv => adv.macAddress === sensor.macAddress) ?? {};
        if (batteryLevel) {
          return { ...sensor, batteryLevel };
        }
        return { ...sensor };
      });

      yield all(
        mapped.map((sensor: SensorState) =>
          put(SensorAction.update(sensor.id, 'batteryLevel', sensor.batteryLevel))
        )
      );

      yield put(BatteryObserverAction.updateSuccess());
    }
  } catch (error) {
    yield put(BatteryObserverAction.updateFail());
  }
}

function* start(): SagaIterator {
  while (true) {
    yield call(updateBatteryLevels);
    yield delay(MILLISECONDS.THIRTY_SECONDS);
  }
}

function* watchBatteryLevels(): SagaIterator {
  yield race({
    start: call(start),
    stop: take(BatteryObserverAction.stop),
  });
}

function* root(): SagaIterator {
  yield takeLeading(BatteryObserverAction.start, watchBatteryLevels);
}

const BatteryObserverSaga = { root, watchBatteryLevels, start, updateBatteryLevels };

export {
  BatteryObserverAction,
  BatteryObserverReducer,
  BatteryObserverSaga,
  BatteryObserverSelector,
};
