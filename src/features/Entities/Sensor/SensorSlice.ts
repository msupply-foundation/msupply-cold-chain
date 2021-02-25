import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { RootState } from '../../../common/store/store';
import { REDUCER, DEPENDENCY } from '../../../common/constants';
import { ProgramAction } from '../../Bluetooth';

export interface SensorState {
  id: string;
  name: string;
  macAddress: string;
  logDelay: number;
  logInterval: number;
  batteryLevel: number;
  programmedDate: number;
}

export interface ById<InterfaceSortedById> {
  [id: string]: InterfaceSortedById;
}

export interface SensorSliceState {
  byId: ById<SensorState>;
  ids: string[];
}

const SensorInitialState: SensorSliceState = {
  byId: {},
  ids: [],
};

export interface FetchAllSuccessPayload {
  sensors: SensorState[];
}

export interface UpdateAction {
  type: string;
  payload: UpdateActionPayload;
}

export interface UpdateActionPayload {
  sensorId: string;
  key: string;
  value: number | string;
}

export interface UpdateSuccessPayload {
  id: string;
  key: string;
  value: string | number;
}

export interface CreateSuccessPayload {
  sensorId: string;
  sensor: SensorState;
}

export interface CreatePayload {
  macAddress: string;
  logInterval: number;
  logDelay: number;
  batteryLevel: number;
}

export interface CreateAction {
  type: string;
  payload: CreatePayload;
}

export interface PrepareActionReturn<SomePayload> {
  payload: SomePayload;
}

const reducers = {
  fetchAll: () => {},
  fetchAllSuccess: {
    prepare: (sensors: SensorState[]) => ({ payload: { sensors } }),
    reducer: (
      draftState: SensorSliceState,
      { payload: { sensors } }: PayloadAction<FetchAllSuccessPayload>
    ) => {
      const byId = sensors.reduce((acc, sensor) => ({ [sensor.id]: sensor, ...acc }), {});
      const ids = sensors.map(({ id }) => id);

      draftState.byId = byId;
      draftState.ids = ids;
    },
  },
  fetchAllFail: () => {},

  update: {
    prepare: (
      sensorId: string,
      key: string,
      value: string | number
    ): PrepareActionReturn<UpdateActionPayload> => ({
      payload: { sensorId, key, value },
    }),
    reducer: () => {},
  },
  updateSuccess: {
    prepare: (
      id: string,
      key: string,
      value: string | number
    ): PrepareActionReturn<UpdateSuccessPayload> => ({
      payload: { id, key, value },
    }),
    reducer: (
      draftState: SensorSliceState,
      { payload: { id, key, value } }: PayloadAction<UpdateSuccessPayload>
    ) => {
      draftState.byId[id] = { ...draftState.byId[id], [key]: value };
    },
  },
  updateFail: () => {},
  create: {
    prepare: (
      macAddress: string,
      logInterval: number,
      logDelay: number,
      batteryLevel: number
    ): PrepareActionReturn<CreatePayload> => ({
      payload: { macAddress, logInterval, logDelay, batteryLevel },
    }),
    reducer: () => {},
  },
  createSuccess: {
    prepare: (
      sensorId: string,
      sensor: SensorState
    ): PrepareActionReturn<CreateSuccessPayload> => ({
      payload: { sensorId, sensor },
    }),
    reducer: (
      draftState: SensorSliceState,
      { payload: { sensorId, sensor } }: PayloadAction<CreateSuccessPayload>
    ) => {
      draftState.byId[sensorId] = sensor;
      draftState.ids.push(sensorId);
    },
  },
  createFail: () => {},
};

const { actions: SensorAction, reducer: SensorReducer } = createSlice({
  name: REDUCER.SENSOR,
  initialState: SensorInitialState,
  reducers,
});

function* fetchAll(): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    const sensors = yield call(sensorManager.getSensors);
    const mapped = sensors.map((sensor: SensorState) => ({ ...sensor }));
    yield put(SensorAction.fetchAllSuccess(mapped));
  } catch (error) {
    yield put(SensorAction.fetchAllFail());
  }
}

function* update({ payload: { sensorId, key, value } }: UpdateAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const manager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    yield call(manager.updateField, sensorId, key, value);
    yield put(SensorAction.updateSuccess(sensorId, key, value));
  } catch (e) {
    yield put(SensorAction.updateFail());
  }
}

function* create({
  payload: { macAddress, logInterval, logDelay, batteryLevel },
}: CreateAction): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);
  try {
    const newlyAddedSensor: SensorState = yield call(
      sensorManager.addNewSensor,
      macAddress,
      logInterval,
      logDelay,
      batteryLevel
    );

    yield put(SensorAction.createSuccess(newlyAddedSensor.id, newlyAddedSensor));
  } catch (error) {
    yield put(SensorAction.createFail());
  }
}

// TODO: Better typing.
function* updateLogInterval({
  payload: { id, logInterval },
}: {
  payload: {
    id: string;
    logInterval: number;
  };
}): SagaIterator {
  yield put(SensorAction.update(id, 'logInterval', logInterval));
}

function* createNewSensor({
  payload: { macAddress, logDelay, logInterval, batteryLevel },
}: CreateAction): SagaIterator {
  yield put(SensorAction.create(macAddress, logInterval, logDelay, batteryLevel));
}

function* root(): SagaIterator {
  yield takeEvery(SensorAction.fetchAll, fetchAll);
  yield takeEvery(SensorAction.create, create);
  yield takeEvery(SensorAction.update, update);
  yield takeEvery(ProgramAction.updateLogIntervalSuccess, updateLogInterval);
  yield takeEvery(ProgramAction.programNewSensorSuccess, createNewSensor);
}

const getById = ({ entities: { sensor } }: RootState): ById<SensorState> => {
  const { byId } = sensor as SensorSliceState;
  return byId;
};

const getName = (state: RootState, id: string): string => {
  const { [id]: sensor } = getById(state);
  const { name, macAddress } = sensor ?? {};

  return name ?? macAddress;
};

const getBatteryLevel = (state: RootState, { id }: { id: string }): number => {
  const { [id]: sensor } = getById(state);
  const { batteryLevel } = sensor;

  return batteryLevel;
};

const SensorSelector = {
  getName,
  getBatteryLevel,
  availableSensorsList: ({ entities: { sensor } }: RootState): { id: string; name: string }[] => {
    const { byId, ids } = sensor as SensorSliceState;
    return ids.map(id => ({ id, name: byId[id].name ?? byId[id].macAddress }));
  },
  macs: ({ entities: { sensor } }: RootState): string[] => {
    const { byId, ids } = sensor as SensorSliceState;
    return ids.map(id => byId[id].macAddress);
  },
  sensors: ({ entities: { sensor } }: RootState): ById<SensorState> => {
    const { byId } = sensor as SensorSliceState;
    return byId;
  },
  sensorsList: ({ entities: { sensor } }: RootState): SensorState[] => {
    const { byId, ids } = sensor as SensorSliceState;
    return ids.map(id => byId[id]);
  },
};

const SensorSaga = {
  root,
  create,
  update,
  fetchAll,
};

export { SensorSaga, SensorSelector, SensorReducer, SensorAction, SensorInitialState };
