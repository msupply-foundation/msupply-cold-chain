import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';
import { REDUCER, DEPENDENCY } from '../../../common/constants';
import { TemperatureBreach } from '../../../common/services/Database/entities';
import { RootState } from '../../../common/store/store';

interface AcknowledgeBreachSliceState {
  acknowledgingSensorId: string;
  acknowledging: boolean;
  updating: boolean;
  fetching: boolean;
  unacknowledged: TemperatureBreach[];
}

const initialState: AcknowledgeBreachSliceState = {
  acknowledgingSensorId: '',
  acknowledging: false,
  updating: false,
  fetching: false,
  unacknowledged: [],
};

interface StartAcknowledgingPayload {
  sensorId: string;
}

interface FetchUnacknowledgedSuccessPayload {
  breaches: TemperatureBreach[];
}

interface TryFetchUnacknowledgedPayload {
  sensorId: string;
}

interface TryAcknowledgePayload {
  sensorId: string;
}

interface StartAcknowledgingPayload {
  sensorId: string;
}

const reducers = {
  startAcknowledging: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: AcknowledgeBreachSliceState,
      { payload: { sensorId } }: PayloadAction<StartAcknowledgingPayload>
    ) => {
      draftState.acknowledging = true;
      draftState.acknowledgingSensorId = sensorId;
    },
  },
  finishAcknowledging: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (draftState: AcknowledgeBreachSliceState) => {
      draftState.acknowledging = false;
      draftState.acknowledgingSensorId = '';
    },
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
  tryFetchUnacknowledged: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (draftState: AcknowledgeBreachSliceState) => {
      draftState.fetching = false;
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

function* tryFetchUnacknowledged({
  payload: { sensorId },
}: PayloadAction<TryFetchUnacknowledgedPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.ACKNOWLEDGE_BREACH_MANAGER);

  try {
    const breaches = yield call(breachManager.getUnacknowledged, sensorId);
    yield put(AcknowledgeBreachAction.fetchUnacknowledgedSuccess(breaches));
  } catch (error) {
    yield put(AcknowledgeBreachAction.fetchUnacknowledgedFail());
  }
}

function* tryAcknowledge({
  payload: { sensorId },
}: PayloadAction<TryAcknowledgePayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.ACKNOWLEDGE_BREACH_MANAGER);

  try {
    const unacknowledged = yield call(breachManager.getUnacknowledged, sensorId);
    yield call(breachManager.acknowledge, unacknowledged);
    yield put(AcknowledgeBreachAction.acknowledgeSuccess(sensorId));
  } catch (error) {
    yield put(AcknowledgeBreachAction.acknowledgeFail(sensorId));
  }
}

function* startAcknowledging({
  payload: { sensorId },
}: PayloadAction<StartAcknowledgingPayload>): SagaIterator {
  yield put(AcknowledgeBreachAction.tryFetchUnacknowledged(sensorId));
}

function* root(): SagaIterator {
  yield takeEvery(AcknowledgeBreachAction.startAcknowledging, startAcknowledging);
  yield takeEvery(AcknowledgeBreachAction.tryAcknowledge, tryAcknowledge);
  yield takeEvery(AcknowledgeBreachAction.tryFetchUnacknowledged, tryFetchUnacknowledged);
}

const AcknowledgeBreachSaga = { root, tryAcknowledge, startAcknowledging };

const acknowledgeBreachState = ({
  breach: { acknowledgeBreach },
}: RootState): AcknowledgeBreachSliceState => acknowledgeBreach;

const sensorId = (state: RootState): string => {
  const { acknowledgingSensorId } = acknowledgeBreachState(state);
  return acknowledgingSensorId;
};

const AcknowledgeBreachSelector = {
  acknowledgeBreachState,
  sensorId,
};

export {
  AcknowledgeBreachAction,
  AcknowledgeBreachReducer,
  AcknowledgeBreachSaga,
  AcknowledgeBreachSelector,
};
