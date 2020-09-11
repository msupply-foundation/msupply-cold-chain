import { ToastAndroid } from 'react-native';
import { createSlice } from '@reduxjs/toolkit';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '~constants';
import { SensorAction } from '../../sensor';

const initialState = {
  isUpdating: false,
};

const reducers = {
  tryUpdateLogInterval: {
    prepare: (id, logInterval) => ({ payload: { id, logInterval } }),
    reducer: draftState => {
      draftState.isUpdating = true;
    },
  },
  updateLogIntervalSuccess: draftState => {
    draftState.isUpdating = false;
  },
  updateLogIntervalFail: draftState => {
    draftState.isUpdating = false;
  },
};

const { actions: UpdateAction, reducer: UpdateReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.UPDATE,
});

const UpdateSelector = {
  isUpdating: ({
    bluetooth: {
      update: { isUpdating },
    },
  }) => {
    return isUpdating;
  },
};

export function* tryUpdateLogInterval({ payload: { id, logInterval } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [btService, sensorManager] = yield call(DependencyLocator.get, [
    DEPENDENCY.BLUETOOTH,
    DEPENDENCY.SENSOR_MANAGER,
  ]);

  try {
    const sensor = yield call(sensorManager.getSensorById, id);
    yield call(btService.updateLogIntervalWithRetries, sensor.macAddress, logInterval, 10);
    yield put(UpdateAction.updateLogIntervalSuccess(id));
    yield put(SensorAction.update(id, 'logInterval', logInterval));
    ToastAndroid.show('Updated log interval', ToastAndroid.SHORT);
  } catch (e) {
    yield put(UpdateAction.updateLogIntervalFail());
    ToastAndroid.show('Could not update log interval', ToastAndroid.SHORT);
  }
}

function* root() {
  yield takeEvery(UpdateAction.tryUpdateLogInterval, tryUpdateLogInterval);
}

const UpdateSaga = { root };

export { UpdateAction, UpdateReducer, UpdateSaga, UpdateSelector };
