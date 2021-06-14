import { UtilService } from '~services/UtilService';
import { SagaIterator } from '@redux-saga/types';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';
import { call, put, takeLatest } from 'redux-saga/effects';
import { RootState } from '~store';
import { MILLISECONDS, REDUCER } from '~common/constants';
import { PrepareActionReturn } from '~common/types/common';
import { getDependency } from '~features/utils/saga';
import {
  DetailSliceState,
  DetailInitPayload,
  DetailInitSuccessPayload,
  UpdateDateRangePayload,
} from '~features/SensorDetail/types';

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

const reducers = {
  updateDateRange: {
    prepare: (
      sensorId: string,
      from: number,
      to: number
    ): PrepareActionReturn<UpdateDateRangePayload> => ({
      payload: { sensorId, from, to },
    }),
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
  init: {
    prepare: (
      sensorId: string,
      minFrom: number,
      maxTo: number
    ): PrepareActionReturn<DetailInitPayload> => ({
      payload: { sensorId, minFrom, maxTo },
    }),
    reducer: (
      draftState: DetailSliceState,
      { payload: { sensorId, minFrom, maxTo } }: PayloadAction<DetailInitPayload>
    ) => {
      draftState.isLoading = true;
      draftState.minFrom = minFrom;
      draftState.maxTo = maxTo;
      draftState.sensorId = sensorId;
      draftState.possibleFrom = minFrom;
      draftState.possibleTo = maxTo;
    },
  },
  initSuccess: {
    prepare: (
      sensorId: string,
      from: number,
      to: number,
      possibleFrom: number,
      possibleTo: number
    ): PrepareActionReturn<DetailInitSuccessPayload> => ({
      payload: { sensorId, from, to, possibleFrom, possibleTo },
    }),
    reducer: (
      draftState: DetailSliceState,
      {
        payload: { sensorId, from, to, possibleFrom, possibleTo },
      }: PayloadAction<DetailInitSuccessPayload>
    ) => {
      draftState.from = from;
      draftState.to = to;
      draftState.sensorId = sensorId;
      draftState.isLoading = false;
      draftState.possibleFrom = possibleFrom;
      draftState.possibleTo = possibleTo;
    },
  },
  initFailure: () => {},
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

function* init({
  payload: { sensorId, maxTo, minFrom },
}: PayloadAction<DetailInitPayload>): SagaIterator {
  const utils: UtilService = yield call(getDependency, 'utilService');

  try {
    const to = Math.min(utils.now(), maxTo);
    const from = Math.max(utils.addDays(to, -3), minFrom);

    yield put(DetailAction.initSuccess(sensorId, from, to, minFrom, maxTo));
  } catch (error) {
    yield put(DetailAction.initFailure());
  }
}

function* root(): SagaIterator {
  yield takeLatest(DetailAction.init, init);
}

const DetailSaga = { root };

export { DetailAction, DetailReducer, DetailSelector, DetailSaga };
