import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery } from 'redux-saga/effects';

import { REDUCER } from '~constants';
import { getDependency } from '~features/utils/saga';
import {
  AcknowledgeBreachManager,
  AcknowledgeBreachSliceState,
  FetchUnacknowledgedSuccessPayload,
  SensorIDPayload,
} from '~features/Breach';
import { TemperatureBreach } from '~services/Database/entities';
import { RootState } from '~store';

const initialState: AcknowledgeBreachSliceState = {
  acknowledgingSensorId: '',
  acknowledging: false,
  updating: false,
  fetching: false,
  unacknowledged: [],
};

const reducers = {
  startAcknowledging: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: AcknowledgeBreachSliceState,
      { payload: { sensorId } }: PayloadAction<SensorIDPayload>
    ) => {
      draftState.acknowledging = true;
      draftState.acknowledgingSensorId = sensorId;
    },
  },
  finishAcknowledging: (draftState: AcknowledgeBreachSliceState) => {
    draftState.acknowledging = false;
    draftState.acknowledgingSensorId = '';
  },

  tryAcknowledge: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (draftState: AcknowledgeBreachSliceState) => {
      draftState.updating = true;
    },
  },
  acknowledgeSuccess: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (draftState: AcknowledgeBreachSliceState) => {
      draftState.updating = false;
      draftState.acknowledging = false;
      draftState.acknowledgingSensorId = '';
    },
  },
  acknowledgeFail: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (draftState: AcknowledgeBreachSliceState) => {
      draftState.updating = false;
      draftState.acknowledging = false;
      draftState.acknowledgingSensorId = '';
    },
  },
  fetchUnacknowledgedSuccess: {
    prepare: (breaches: TemperatureBreach[]) => ({ payload: { breaches } }),
    reducer: (
      draftState: AcknowledgeBreachSliceState,
      { payload: { breaches } }: PayloadAction<FetchUnacknowledgedSuccessPayload>
    ) => {
      draftState.fetching = false;
      draftState.unacknowledged = breaches;
    },
  },
  fetchUnacknowledgedFail: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (draftState: AcknowledgeBreachSliceState) => {
      draftState.fetching = false;
    },
  },
};

const { actions: AcknowledgeBreachAction, reducer: AcknowledgeBreachReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.ACKNOWLEDGE_BREACH,
});

const AcknowledgeBreachSelector = {
  id: ({ breach: { acknowledgeBreach } }: RootState): string => {
    const { acknowledgingSensorId } = acknowledgeBreach;
    return acknowledgingSensorId;
  },
  isAcknowledging: ({ breach: { acknowledgeBreach } }: RootState): boolean => {
    const { acknowledging } = acknowledgeBreach;
    return acknowledging;
  },
  isFetching: ({ breach: { acknowledgeBreach } }: RootState): boolean => {
    const { fetching } = acknowledgeBreach;
    return fetching;
  },
  unacknowledgedBreaches: ({ breach: { acknowledgeBreach } }: RootState): TemperatureBreach[] => {
    const { unacknowledged } = acknowledgeBreach;
    return unacknowledged;
  },
};

function* tryFetchUnacknowledged({
  payload: { sensorId },
}: PayloadAction<SensorIDPayload>): SagaIterator {
  const breachManager: AcknowledgeBreachManager = yield call(
    getDependency,
    'acknowledgeBreachManager'
  );

  try {
    const breaches: TemperatureBreach[] = yield call(breachManager.getUnacknowledged, sensorId);
    yield put(AcknowledgeBreachAction.fetchUnacknowledgedSuccess(breaches));
  } catch (error) {
    yield put(AcknowledgeBreachAction.fetchUnacknowledgedFail(sensorId));
  }
}

function* tryAcknowledge({ payload: { sensorId } }: PayloadAction<SensorIDPayload>): SagaIterator {
  const breachManager: AcknowledgeBreachManager = yield call(
    getDependency,
    'acknowledgeBreachManager'
  );

  try {
    const unacknowledged: TemperatureBreach[] = yield call(
      breachManager.getUnacknowledged,
      sensorId
    );
    yield call(breachManager.acknowledge, unacknowledged);
    yield put(AcknowledgeBreachAction.acknowledgeSuccess(sensorId));
  } catch (error) {
    yield put(AcknowledgeBreachAction.acknowledgeFail(sensorId));
  }
}

function* root(): SagaIterator {
  yield takeEvery(AcknowledgeBreachAction.startAcknowledging, tryFetchUnacknowledged);
  yield takeEvery(AcknowledgeBreachAction.tryAcknowledge, tryAcknowledge);
}

const AcknowledgeBreachSaga = { root, tryAcknowledge };

export {
  AcknowledgeBreachAction,
  AcknowledgeBreachReducer,
  AcknowledgeBreachSaga,
  AcknowledgeBreachSelector,
};
