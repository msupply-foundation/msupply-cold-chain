import _ from 'lodash';
import { eventChannel } from 'redux-saga';
import { SagaIterator } from '@redux-saga/types';
import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';
import { BleService, BleError } from 'msupply-ble-service';
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

export function callback(btService: BleService) {
  const throttledScan = _.throttle(btService.scanForSensors, 1000);
  return eventChannel(emitter => {
    throttledScan((err: BleError | null, deviceDescriptor: string) => {
      if (err) {
        console.log(JSON.stringify(err));
      }
      emitter(deviceDescriptor);
    });
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
      const deviceDescriptor = yield take(channel);
      const foundSensors = yield select(ScanSelector.foundSensors);
      const macs = yield select(SensorSelector.macs);
      /*  Legacy Blue Maestro devices which have already been paired should be "already found" */
      const legacy = deviceDescriptor.split('|')[0].trim();

      const alreadyFound =
        foundSensors.includes(deviceDescriptor) ||
        macs.includes(deviceDescriptor) ||
        foundSensors.includes(legacy) ||
        macs.includes(legacy);

      if (!alreadyFound) {
        yield put(ScanAction.foundSensor(deviceDescriptor));
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
