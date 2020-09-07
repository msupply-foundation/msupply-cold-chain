import { createSlice } from '@reduxjs/toolkit';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { SERVICES, REDUCER_SHAPE } from '~constants';
import { SensorAction } from '../../sensor';

const initialState = {
  updatingById: {},
};

const reducers = {
  tryUpdateLogInterval: {
    prepare: (id, logInterval) => ({ payload: { id, logInterval } }),
    reducer: (draftState, { payload: { id } }) => {
      draftState.updatingById[id] = true;
    },
  },
  updateLogIntervalSuccess: {
    prepare: id => ({ payload: { id } }),
    reducer: (draftState, { payload: { id } }) => {
      draftState.updatingById[id] = false;
    },
  },
  updateLogIntervalFail: {
    prepare: id => ({ payload: { id } }),
    reducer: (draftState, { payload: { id } }) => {
      draftState.updatingById[id] = false;
    },
  },
};

const { actions: UpdateAction, reducer: UpdateReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER_SHAPE.UPDATE,
});

const UpdateSelector = {
  isUpdating: ({
    bluetooth: {
      update: { updatingById },
    },
  }) => {
    return updatingById;
  },
};

export function* tryUpdateLogInterval({ payload: { id, logInterval } }) {
  const getServices = yield getContext('getServices');
  const [btService, sensorManager] = yield call(getServices, [
    SERVICES.BLUETOOTH,
    SERVICES.SENSOR_MANAGER,
  ]);

  try {
    const sensor = yield call(sensorManager.getSensorById, id);
    yield call(btService.updateLogIntervalWithRetries, sensor.macAddress, logInterval, 10);
    yield put(UpdateAction.updateLogIntervalSuccess(id));
    yield put(SensorAction.update(id, 'logInterval', logInterval));
  } catch (e) {
    yield put(UpdateAction.updateLogIntervalFail());
  }
}

function* root() {
  yield takeEvery(UpdateAction.tryUpdateLogInterval, tryUpdateLogInterval);
}

const UpdateSaga = { root };

export { UpdateAction, UpdateReducer, UpdateSaga, UpdateSelector };
