import { SagaIterator } from '@redux-saga/types';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';
import { RootState } from '../../../common/store/store';
import { MILLISECONDS, DEPENDENCY, REDUCER } from '../../../common/constants';

interface DetailSliceState {
  sensorId: string;
  from: number;
  to: number;
  possibleFrom: number;
  possibleTo: number;
  isLoading: boolean;
}

const initialState: DetailSliceState = {
  sensorId: '',
  from: 0,
  to: 0,
  isLoading: false,
  possibleFrom: 0,
  possibleTo: 0,
};

interface UpdateDateRangePayload {
  from: number;
  to: number;
}

interface FetchPayload {
  sensorId: string;
}

export interface FetchSuccessPayload {
  sensorId: string;
  from: number;
  to: number;
  possibleFrom: number;
  possibleTo: number;
}

const reducers = {
  updateDateRange: {
    prepare: (from: number, to: number) => ({ payload: { from, to } }),
    reducer: (
      draftState: DetailSliceState,
      { payload: { from, to } }: PayloadAction<UpdateDateRangePayload>
    ) => {
      draftState.from = from;
      draftState.to = to;
    },
  },
  flush: (draftState: DetailSliceState) => {
    draftState.sensorId = initialState.sensorId;
    draftState.from = initialState.from;
    draftState.to = initialState.to;
    draftState.isLoading = initialState.isLoading;
  },
  fetch: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: DetailSliceState,
      { payload: { sensorId } }: PayloadAction<FetchPayload>
    ) => {
      draftState.isLoading = true;
      draftState.sensorId = sensorId;
    },
  },
  fetchSuccess: {
    prepare: (
      sensorId: string,
      from: number,
      to: number,
      possibleFrom: number,
      possibleTo: number
    ) => ({
      payload: { sensorId, from, to, possibleFrom, possibleTo },
    }),
    reducer: (
      draftState: DetailSliceState,
      {
        payload: { sensorId, from, to, possibleFrom, possibleTo },
      }: PayloadAction<FetchSuccessPayload>
    ) => {
      draftState.from = from;
      draftState.to = to;
      draftState.sensorId = sensorId;
      draftState.isLoading = false;
      draftState.possibleFrom = possibleFrom;
      draftState.possibleTo = possibleTo;
    },
  },
  fetchFail: () => {},
};

const { actions: DetailAction, reducer: DetailReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.DETAIL,
});

const selectTo = ({ sensorDetail: { detail } }: RootState): number => {
  const { to } = detail;
  return to;
};

const selectFrom = ({ sensorDetail: { detail } }: RootState): number => {
  const { from } = detail;
  return from;
};

const fromTo = createSelector([selectFrom, selectTo], (from, to) => {
  return { from, to };
});
// TODO: FIX Types
const fromToRange = createSelector([fromTo], ({ from, to }) => {
  const options = { allDay: true };
  return (moment(from * MILLISECONDS.ONE_SECOND) as any).twix(
    to * MILLISECONDS.ONE_SECOND,
    options
  );
});

const DetailSelector = {
  from: selectFrom,
  to: selectTo,
  fromToRange,
  fromTo,
  possibleFromTo: ({
    sensorDetail: { detail },
  }: RootState): { possibleFrom: number; possibleTo: number } => {
    const { possibleFrom, possibleTo } = detail;
    return { possibleFrom: possibleFrom * 1000, possibleTo: possibleTo * 1000 };
  },

  sensorId: ({ sensorDetail: { detail } }: RootState): string => {
    const { sensorId } = detail;
    return sensorId;
  },
  isLoading: ({ sensorDetail: { detail } }: RootState): boolean => {
    const { isLoading } = detail;
    return isLoading;
  },
};

function* fetch({ payload: { sensorId } }: PayloadAction<FetchPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);

  try {
    const { possibleFrom, possibleTo, from, to } = yield call(
      sensorManager.getSensorState,
      sensorId
    );

    yield put(DetailAction.fetchSuccess(sensorId, from, to, possibleFrom, possibleTo));
  } catch (error) {
    yield put(DetailAction.fetchFail());
  }
}

function* root(): SagaIterator {
  yield takeEvery(DetailAction.fetch, fetch);
}

const DetailSaga = { root };

export { DetailAction, DetailReducer, DetailSelector, DetailSaga };
