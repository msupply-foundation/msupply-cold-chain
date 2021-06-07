import { SensorManager } from '~features';
import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';

import { RootState } from '~store';
import { REDUCER } from '~constants';
import { ProgramAction } from '~features/Bluetooth/Program/ProgramSlice';
import { getDependency } from '~features/utils/saga';
import { ById, PrepareActionReturn } from '~common/types/common';

export interface SensorState {
  id: string;
  name: string;
  macAddress: string;
  logDelay: number;
  logInterval: number;
  batteryLevel: number;
  programmedDate: number;
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
export interface RemovePayload {
  id: string;
}

const reducers = {
  tryRemove: {
    prepare: (id: string) => ({ payload: { id } }),
    reducer: () => {},
  },
  removeSuccess: {
    prepare: (id: string) => ({ payload: { id } }),
    reducer: (draftState: SensorSliceState, { payload: { id } }: PayloadAction<RemovePayload>) => {
      draftState.ids = draftState.ids.filter((sensorId: string) => sensorId !== id);
      delete draftState.byId[id];
    },
  },
  removeFailure: {
    prepare: (errorMessage: string) => ({ payload: { errorMessage } }),
    reducer: () => {},
  },
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
  updateFail: {
    prepare: (errorMessage: string) => ({ payload: { errorMessage } }),
    reducer: () => {},
  },
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

const getById = ({ entities: { sensor } }: RootState): ById<SensorState> => {
  const { byId } = sensor;
  return byId;
};

const getName = (state: RootState, { id }: { id: string }): string => {
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
  sensorIds: ({ entities: { sensor } }: RootState): string[] => {
    const { ids } = sensor;
    return ids;
  },
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

function* fetchAll(): SagaIterator {
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');
  try {
    const sensors = yield call(sensorManager.getAll);
    const mapped = sensors.map((sensor: SensorState) => ({ ...sensor }));
    yield put(SensorAction.fetchAllSuccess(mapped));
  } catch (error) {
    yield put(SensorAction.fetchAllFail());
  }
}

function* update({ payload: { sensorId, key, value } }: UpdateAction): SagaIterator {
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');
  try {
    yield call(sensorManager.update, sensorId, { [key]: value });
    yield put(SensorAction.updateSuccess(sensorId, key, value));
  } catch (e) {
    yield put(SensorAction.updateFail(e.message));
  }
}

function* create({
  payload: { macAddress, logInterval, logDelay, batteryLevel },
}: CreateAction): SagaIterator {
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');
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

function* remove({ payload: { id } }: PayloadAction<RemovePayload>): SagaIterator {
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');

  try {
    yield call(sensorManager.remove, id);
    yield put(SensorAction.removeSuccess(id));
  } catch (error) {
    yield put(SensorAction.removeFailure(error.message));
  }
}

function* root(): SagaIterator {
  yield takeEvery(SensorAction.fetchAll, fetchAll);
  yield takeEvery(SensorAction.create, create);
  yield takeEvery(SensorAction.update, update);
  yield takeEvery(ProgramAction.updateLogIntervalSuccess, updateLogInterval);
  yield takeEvery(ProgramAction.programNewSensorSuccess, createNewSensor);
  yield takeLatest(SensorAction.tryRemove, remove);
}

const SensorSaga = {
  root,
  create,
  update,
  fetchAll,
};

export { SensorSaga, SensorSelector, SensorReducer, SensorAction, SensorInitialState };
