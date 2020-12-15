import { eventChannel } from 'redux-saga';
import { createSlice } from '@reduxjs/toolkit';
import {
  take,
  getContext,
  call,
  put,
  cancelled,
  race,
  takeLeading,
  select,
} from 'redux-saga/effects';
import { DEPENDENCY, REDUCER } from '~constants';
import { SensorSelector, SensorAction } from '../../Entities';

export const ScanInitialState = {
  foundSensors: [],
  isScanning: false,
};
const reducers = {
  tryStart: () => {},
  startSuccess: draftState => {
    draftState.isScanning = true;
  },
  startFail: draftState => {
    draftState.isScanning = false;
  },
  tryStop: () => {},
  stopSuccess: draftState => {
    draftState.foundSensors = [];
    draftState.isScanning = false;
  },
  stopFail: draftState => {
    draftState.foundSensors = [];
    draftState.isScanning = false;
  },
  foundSensor: {
    prepare: mac => ({ payload: { mac } }),
    reducer: (draftState, { payload: { mac } }) => {
      draftState.foundSensors.push(mac);
    },
  },
};

const extraReducers = {
  [SensorAction.createSuccess]: (
    draftState,
    {
      payload: {
        sensor: { macAddress },
      },
    }
  ) => {
    draftState.foundSensors = draftState.foundSensors.filter(mac => macAddress !== mac);
  },
};

const { actions: ScanAction, reducer: ScanReducer } = createSlice({
  initialState: ScanInitialState,
  reducers,
  extraReducers,
  name: REDUCER.SCAN,
});

const ScanSelector = {
  foundSensors: ({
    bluetooth: {
      scan: { foundSensors },
    },
  }) => {
    return foundSensors;
  },
  isScanning: ({
    bluetooth: {
      scan: { isScanning },
    },
  }) => {
    return isScanning;
  },
};

export function* stop() {
  yield take(ScanAction.tryStop);

  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const btService = yield call(DependencyLocator.get, DEPENDENCY.BLUETOOTH);

  try {
    yield call(btService.stopScan);
    yield put(ScanAction.stopSuccess());
  } catch (error) {
    yield put(ScanAction.stopFail(error.message));
  }
}

export function callback(btService) {
  return eventChannel(emitter => {
    btService.scanForSensors(device => {
      emitter(device);
    });
    return () => {};
  });
}

function* start() {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const btService = yield call(DependencyLocator.get, DEPENDENCY.BLUETOOTH);

  yield put(ScanAction.startSuccess());

  try {
    const channel = yield call(callback, btService);

    while (true) {
      const device = yield take(channel);
      const foundSensors = yield select(ScanSelector.foundSensors);
      const macs = yield select(SensorSelector.macs);
      const alreadyFound = foundSensors.includes(device?.id) || macs.includes(device?.id);

      if (!alreadyFound) {
        yield put(ScanAction.foundSensor(device?.id));
      }
    }
  } catch (e) {
    yield put(ScanAction.startFail());
  } finally {
    if (yield cancelled()) {
      btService.stopScan();
    }
  }
}

function* stopOrStart() {
  yield race({ start: call(start), end: call(stop) });
}

function* root() {
  yield takeLeading(ScanAction.tryStart, stopOrStart);
}

const ScanSaga = { root, stopOrStart, start, stop };

export { ScanAction, ScanReducer, ScanSaga, ScanSelector };
