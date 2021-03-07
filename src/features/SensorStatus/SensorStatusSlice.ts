import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';
import { RootState } from '../../common/store/store';
import { DEPENDENCY, REDUCER } from '../../common/constants';
import { AcknowledgeBreachAction, ConsecutiveBreachAction } from '../Breach';
import { SensorAction } from '../Entities';
import { FormatService } from '../../common/services';

export interface SensorStatus {
  name: string;
  macAddress: string;
  logInterval: number;
  batteryLevel: number;
  logDelay: number;
  mostRecentLogTimestamp: number;
  firstTimestamp: number;
  numberOfLogs: number;
  currentTemperature: number;
  minChartTimestamp: number;
  isInHotBreach: boolean;
  isInColdBreach: boolean;
  hasHotBreach: boolean;
  hasColdBreach: boolean;
  isLowBattery: boolean;
  hasLogs: boolean;
}

interface SensorStatusSliceState {
  fetchingById: Record<string, boolean>;
  byId: Record<string, SensorStatus>;
}

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
  return status;
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

  return isFetching;
};

const SensorStatusSelector = {
  getFetchingById,
  hasData,
  lastDownloadTime,
  isLoading,
  getStatus,
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

    return String(currentTemperature);
  },
};

interface FetchPayload {
  sensorId: string;
}

interface FetchSuccessPayload {
  sensorId: string;
  status: SensorStatus;
}

interface FetchFailPayload {
  sensorId: string;
}

const reducers = {
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
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorStatusManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_STATUS_MANAGER);
  try {
    const state = yield call(sensorStatusManager.getSensorStatus, sensorId);
    yield put(SensorStatusAction.fetchSuccess(sensorId, state));
  } catch (error) {
    yield put(SensorStatusAction.fetchFail(sensorId));
  }
}

function* refreshSensorStatus({
  payload: { sensorId },
}: PayloadAction<{ sensorId: string }>): SagaIterator {
  yield put(SensorStatusAction.fetch(sensorId));
}

function* root(): SagaIterator {
  yield takeEvery(SensorStatusAction.fetch, getSensorStatus);
  yield takeEvery(ConsecutiveBreachAction.createSuccess, refreshSensorStatus);
  yield takeEvery(SensorAction.update, refreshSensorStatus);
  yield takeEvery(SensorAction.createSuccess, refreshSensorStatus);
  yield takeEvery(AcknowledgeBreachAction.acknowledgeSuccess, refreshSensorStatus);
}

const SensorStatusSaga = { root };

export { SensorStatusAction, SensorStatusReducer, SensorStatusSaga, SensorStatusSelector };
