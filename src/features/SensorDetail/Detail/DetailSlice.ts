import { UtilService } from '~services/UtilService';
import { PrepareActionReturn } from './../../Sync/types';
import { SagaIterator } from '@redux-saga/types';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';
import { RootState } from '~store';
import { MILLISECONDS, DEPENDENCY, REDUCER } from '~common/constants';
import { getDependency } from '~features/utils/saga';

interface DetailSliceState {
  sensorId: string;
  from: number;
  to: number;
  possibleFrom: number;
  possibleTo: number;
  isLoading: boolean;
  minFrom: number;
  maxTo: number;
}

const initialState: DetailSliceState = {
  sensorId: '',
  from: 0,
  to: 0,
  isLoading: false,
  possibleFrom: 0,
  possibleTo: 0,
  minFrom: 0,
  maxTo: 0,
};

interface UpdateDateRangePayload {
  from: number;
  to: number;
}

interface FetchPayload {
  sensorId: string;
  minFrom: number;
  maxTo: number;
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
    prepare: (
      sensorId: string,
      minFrom: number,
      maxTo: number
    ): PrepareActionReturn<FetchPayload> => ({
      payload: { sensorId, minFrom, maxTo },
    }),
    reducer: (
      draftState: DetailSliceState,
      { payload: { sensorId, minFrom, maxTo } }: PayloadAction<FetchPayload>
    ) => {
      draftState.isLoading = true;
      draftState.minFrom = minFrom;
      draftState.maxTo = maxTo;
      draftState.sensorId = sensorId;
      draftState.possibleFrom = minFrom;
      draftState.possibleTo = maxTo;
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

const fromTo = createSelector<RootState, number, number, { from: number; to: number }>(
  [selectFrom, selectTo],
  (from, to) => {
    return { from, to };
  }
);
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

function* fetch({
  payload: { sensorId, maxTo, minFrom },
}: PayloadAction<FetchPayload>): SagaIterator {
  const utils: UtilService = yield call(getDependency, 'utilService');

  try {
    const to = Math.min(utils.now(), maxTo);
    const from = Math.max(utils.threeDaysBefore(to), minFrom);

    yield put(DetailAction.fetchSuccess(sensorId, from, to, minFrom, maxTo));
  } catch (error) {
    yield put(DetailAction.fetchFail());
  }
}

function* root(): SagaIterator {
  yield takeEvery(DetailAction.fetch, fetch);
}

const DetailSaga = { root };

export { DetailAction, DetailReducer, DetailSelector, DetailSaga };
