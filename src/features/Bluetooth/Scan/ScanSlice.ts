import _ from 'lodash';
import { Buffer } from 'buffer';
import { eventChannel } from 'redux-saga';
import { SagaIterator } from '@redux-saga/types';
import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';
import { BleService, ScanCallback, BleError, Device } from 'msupply-ble-service';
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
import { BLUE_MAESTRO } from './../../../common/constants/Bluetooth';
import { DEPENDENCY, REDUCER } from '../../../common/constants';
import { RootState } from '../../../common/store/store';
import { SensorSelector, SensorAction, SensorState } from '~features/Entities/Sensor/SensorSlice';

interface ScanSlice {
  foundSensors: string[];
  isScanning: boolean;
}

export const ScanInitialState: ScanSlice = {
  foundSensors: [],
  isScanning: false,
};
const reducers = {
  tryStart: () => {},
  startSuccess: (draftState: ScanSlice) => {
    draftState.isScanning = true;
  },
  startFail: (draftState: ScanSlice) => {
    draftState.isScanning = false;
  },
  tryStop: () => {},
  stopSuccess: (draftState: ScanSlice) => {
    draftState.foundSensors = [];
    draftState.isScanning = false;
  },
  stopFail: (draftState: ScanSlice) => {
    draftState.foundSensors = [];
    draftState.isScanning = false;
  },
  foundSensor: {
    prepare: (mac: string) => ({ payload: { mac } }),
    reducer: (draftState: ScanSlice, { payload: { mac } }: { payload: { mac: string } }) => {
      draftState.foundSensors.push(mac);
    },
  },
};

const extraReducers = (builder: ActionReducerMapBuilder<ScanSlice>) => {
  builder.addCase(
    SensorAction.createSuccess,
    (
      draftState: ScanSlice,
      {
        payload: {
          sensor: { macAddress },
        },
      }: { payload: { sensor: SensorState } }
    ) => {
      draftState.foundSensors = draftState.foundSensors.filter(mac => macAddress !== mac);
    }
  );
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
  }: RootState): string[] => {
    return foundSensors;
  },
  isScanning: ({
    bluetooth: {
      scan: { isScanning },
    },
  }: RootState): boolean => {
    return isScanning;
  },
};

export function* stop(): SagaIterator {
  yield take(ScanAction.tryStop);

  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const btService = yield call(DependencyLocator.get, DEPENDENCY.BLUETOOTH);

  try {
    yield call(btService.stopScan);
    yield put(ScanAction.stopSuccess());
  } catch (error) {
    yield put(ScanAction.stopFail());
  }
}

// TODO: Fix type
export function callback(btService: BleService): any {
  const throttledScan = _.throttle(btService.scanForSensors, 1000);
  return eventChannel(emitter => {
    throttledScan(
      (err: BleError, device: Device): ScanCallback => {
        if (err) {
          console.log(JSON.stringify(err));
        }
        // TODO: Make more generic.
        if (device && device?.manufacturerData) {
          const isBlueMaestroDevice =
            Buffer.from(device.manufacturerData, 'base64').readInt16LE(0) ===
            BLUE_MAESTRO.MANUFACTURER_ID;
          //   console.log(`ThrottledScan returns BlueMaestro? ${isBlueMaestroDevice}`);
          if (isBlueMaestroDevice) {
            emitter(device);
          }
        } else {
          //          console.log(`ThrottledScan returns null device`);
        }
      }
    );
    return () => {};
  });
}

function* start(): SagaIterator {
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

function* stopOrStart(): SagaIterator {
  yield race({ start: call(start), end: call(stop) });
}

function* root(): SagaIterator {
  yield takeLeading(ScanAction.tryStart, stopOrStart);
}

const ScanSaga = { root, stopOrStart, start, stop };

export { ScanAction, ScanReducer, ScanSaga, ScanSelector };
