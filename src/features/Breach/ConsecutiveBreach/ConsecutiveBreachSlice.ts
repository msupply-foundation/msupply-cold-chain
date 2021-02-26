import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '../../../common/constants';
import {
  Sensor,
  TemperatureBreach,
  TemperatureLog,
} from '../../../common/services/Database/entities';
import { ChartAction } from '../../Chart';

interface ConsecutiveBreachSliceState {
  creatingById: Record<string, boolean>;
}

const initialState: ConsecutiveBreachSliceState = {
  creatingById: {},
};

interface CreatePayload {
  sensor: Sensor;
}

interface CreateSuccessPayload {
  sensorId: string;
}

interface CreateFailPayload {
  sensor: Sensor;
}

const reducers = {
  create: {
    prepare: (sensor: Sensor) => ({ payload: { sensor } }),
    reducer: (
      draftState: ConsecutiveBreachSliceState,
      { payload: { sensor } }: PayloadAction<CreatePayload>
    ) => {
      const { id } = sensor;
      draftState.creatingById[id] = true;
    },
  },
  createSuccess: {
    prepare: (
      sensorId: string,
      updatedBreaches: TemperatureBreach[],
      updatedLogs: TemperatureLog[]
    ) => ({
      payload: { sensorId, updatedBreaches, updatedLogs },
    }),
    reducer: (
      draftState: ConsecutiveBreachSliceState,
      { payload: { sensorId } }: PayloadAction<CreateSuccessPayload>
    ) => {
      draftState.creatingById[sensorId] = true;
    },
  },
  createFail: {
    prepare: (sensor: Sensor) => ({ payload: { sensor } }),
    reducer: (
      draftState: ConsecutiveBreachSliceState,
      { payload: { sensor } }: PayloadAction<CreateFailPayload>
    ) => {
      const { id } = sensor;
      draftState.creatingById[id] = true;
    },
  },
};

const { actions: ConsecutiveBreachAction, reducer: ConsecutiveBreachReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.CONSECUTIVE_BREACH,
});

function* create({ payload: { sensor } }: PayloadAction<CreatePayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.CONSECUTIVE_BREACH_MANAGER);

  const { id } = sensor;

  try {
    const logs = yield call(breachManager.getLogsToCheck, id);
    const configs = yield call(breachManager.getBreachConfigs);
    const mostRecentBreach = yield call(breachManager.getMostRecentBreach, id);

    const [breaches, updatedLogs] = yield call(
      breachManager.createBreaches,
      sensor,
      logs,
      configs,
      mostRecentBreach
    );

    yield call(breachManager.updateBreaches, breaches, updatedLogs);
    yield put(ChartAction.getListChartData(id));
    yield put(ConsecutiveBreachAction.createSuccess(id, breaches, updatedLogs));
  } catch (e) {
    yield put(ConsecutiveBreachAction.createFail(sensor));
  }
}

function* root(): SagaIterator {
  yield takeEvery(ConsecutiveBreachAction.create, create);
}

const ConsecutiveBreachSaga = { root };

const ConsecutiveBreachSelector = {};

export {
  ConsecutiveBreachAction,
  ConsecutiveBreachReducer,
  ConsecutiveBreachSaga,
  ConsecutiveBreachSelector,
};
