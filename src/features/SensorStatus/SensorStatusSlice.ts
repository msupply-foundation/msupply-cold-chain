import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { FailurePayload, PrepareActionReturn, ById } from '~common/types/common';
import { RootState } from '~store';
import { REDUCER } from '~common/constants';
import { SensorAction, AcknowledgeBreachAction, ConsecutiveBreachAction } from '~features';
import { FormatService } from '~common/services';
import { getDependency } from '~features/utils/saga';
import { HydrateAction } from '~features/Hydrate';
import {
  FetchFailPayload,
  FetchPayload,
  FetchSuccessPayload,
  SensorStatus,
  SensorStatusSliceState,
  SensorStatusManager,
} from '~features/SensorStatus';

const initialState: SensorStatusSliceState = {
  fetchingById: {},
  byId: {},
};

const getById = ({ sensorStatus: { byId } }: RootState) => {
  return byId;
};

const getFetchingById = ({
  sensorStatus: { fetchingById },
}: RootState): Record<string, boolean> => {
  return fetchingById;
};

const getStatus = (state: RootState, id: string): SensorStatus => {
  const { [id]: status } = getById(state) ?? {};
  return status ?? {};
};

const hasData = (state: RootState, { id }: { id: string }): boolean => {
  const { hasLogs } = getStatus(state, id);
  return !!hasLogs;
};

const lastDownloadTime = (
  state: RootState,
  { id, formatter }: { id: string; formatter: FormatService }
): string => {
  const { mostRecentLogTimestamp } = getStatus(state, id);
  return formatter.lastDownloadTime(mostRecentLogTimestamp);
};

const isLoading = (state: RootState, { id }: { id: string }): boolean => {
  const { [id]: isFetching } = getFetchingById(state);

  return isFetching ?? true;
};

const SensorStatusSelector = {
  getFetchingById,
  hasData,
  lastDownloadTime,
  isLoading,
  getStatus,
  possibleTo: ({ sensorStatus }: RootState, id: string): number => {
    const status = sensorStatus.byId[id];
    const { mostRecentLogTimestamp } = status;
    return mostRecentLogTimestamp;
  },
  possibleFrom: ({ sensorStatus }: RootState, id: string): number => {
    const status = sensorStatus.byId[id];
    const { firstTimestamp } = status;
    return firstTimestamp;
  },
  hasHotBreach: ({ sensorStatus }: RootState, { id }: { id: string }): boolean => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { hasHotBreach } = status ?? {};

    return hasHotBreach;
  },
  hasColdBreach: ({ sensorStatus }: RootState, { id }: { id: string }): boolean => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { hasColdBreach } = status ?? {};

    return hasColdBreach;
  },
  isLowBattery: ({ sensorStatus }: RootState, { id }: { id: string }): boolean => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { isLowBattery } = status ?? {};

    return isLowBattery;
  },
  isInDanger: ({ sensorStatus }: RootState, { id }: { id: string }): boolean => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { hasColdBreach, hasHotBreach, isLowBattery } = status ?? {};

    return hasColdBreach || hasHotBreach || isLowBattery;
  },
  currentTemperature: ({ sensorStatus }: RootState, { id }: { id: string }): string => {
    const { byId } = sensorStatus;
    const { [id]: status } = byId;
    const { currentTemperature } = status ?? {};

    if (isNaN(currentTemperature)) {
      return String('Unknown');
    }

    // Round to 1 decimal places
    return String(currentTemperature.toFixed(1));
  },
};

const reducers = {
  fetchAllSuccess: {
    prepare: (byId: ById<SensorStatus>): PrepareActionReturn<ById<SensorStatus>> => ({
      payload: byId,
    }),
    reducer: (
      draftState: SensorStatusSliceState,
      { payload }: PayloadAction<ById<SensorStatus>>
    ) => {
      draftState.byId = payload;
      Object.keys(payload).forEach(sensorId => {
        draftState.fetchingById[sensorId] = false;
      });
    },
  },
  fetchAllFailure: {
    prepare: (errorMessage: string): PrepareActionReturn<FailurePayload> => ({
      payload: { errorMessage },
    }),
    reducer: () => {},
  },
  fetch: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: SensorStatusSliceState,
      { payload: { sensorId } }: PayloadAction<FetchPayload>
    ) => {
      draftState.fetchingById[sensorId] = true;
    },
  },
  fetchSuccess: {
    prepare: (sensorId: string, status: SensorStatus) => ({ payload: { sensorId, status } }),
    reducer: (
      draftState: SensorStatusSliceState,
      { payload: { sensorId, status } }: PayloadAction<FetchSuccessPayload>
    ) => {
      draftState.fetchingById[sensorId] = false;
      draftState.byId[sensorId] = status;
    },
  },
  fetchFail: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: SensorStatusSliceState,
      { payload: { sensorId } }: PayloadAction<FetchFailPayload>
    ) => {
      draftState.fetchingById[sensorId] = false;
    },
  },
};

const { actions: SensorStatusAction, reducer: SensorStatusReducer } = createSlice({
  name: REDUCER.SENSOR_STATUS,
  initialState,
  reducers,
});

function* getSensorStatus({ payload: { sensorId } }: PayloadAction<FetchPayload>): SagaIterator {
  const sensorStatusManager: SensorStatusManager = yield call(getDependency, 'sensorStatusManager');

  try {
    const state: SensorStatus = yield call(sensorStatusManager.getSensorStatus, sensorId);
    yield put(SensorStatusAction.fetchSuccess(sensorId, state));
  } catch (error) {
    yield put(SensorStatusAction.fetchFail(sensorId));
  }
}

function* getAllStatuses(): SagaIterator {
  const sensorStatusManager: SensorStatusManager = yield call(getDependency, 'sensorStatusManager');

  try {
    const statuses: ById<SensorStatus> = yield call(sensorStatusManager.getAllStatuses);
    yield put(SensorStatusAction.fetchAllSuccess(statuses));
  } catch (error) {
    yield put(SensorStatusAction.fetchAllFailure((error as Error).message));
  }
}

function* root(): SagaIterator {
  yield takeEvery(SensorStatusAction.fetch, getSensorStatus);
  yield takeEvery(ConsecutiveBreachAction.createSuccess, getSensorStatus);
  yield takeEvery(SensorAction.update, getSensorStatus);
  yield takeEvery(SensorAction.createSuccess, getSensorStatus);
  yield takeEvery(AcknowledgeBreachAction.acknowledgeSuccess, getSensorStatus);
  yield takeLatest(HydrateAction.hydrate, getAllStatuses);
}

const SensorStatusSaga = { root, getAllStatuses, getSensorStatus };

export { SensorStatusAction, SensorStatusReducer, SensorStatusSaga, SensorStatusSelector };
