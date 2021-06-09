import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { PrepareActionReturn } from '~common/types/common';
import { RootState } from '~store';
import { REDUCER } from '~constants';
import {
  DetailCumulativeBreachSliceState,
  DetailAction,
  DetailSelector,
} from '~features/SensorDetail';
import { CumulativeBreachLookup, CumulativeBreachManager } from '~features/Breach';
import { FormatService } from '~common/services';
import { getDependency } from '~features/utils/saga';
import { FetchCumulativesSuccess, UpdateDataPayload } from '~features/SensorDetail';

const initialState = {
  hot: null,
  cold: null,
  isLoading: false,
};

const reducers = {
  init: () => {},
  fetch: {
    prepare: (
      sensorId: string,
      from: number,
      to: number
    ): PrepareActionReturn<UpdateDataPayload> => ({ payload: { sensorId, from, to } }),
    reducer: (draftState: DetailCumulativeBreachSliceState) => {
      draftState.isLoading = true;
      draftState.hot = null;
      draftState.cold = null;
    },
  },
  fetchSuccess: {
    prepare: (
      sensorId: string,
      cumulatives: CumulativeBreachLookup
    ): PrepareActionReturn<FetchCumulativesSuccess> => ({
      payload: { cumulatives, sensorId },
    }),
    reducer: (
      draftState: DetailCumulativeBreachSliceState,
      { payload: { cumulatives } }: PayloadAction<FetchCumulativesSuccess>
    ) => {
      const { hot, cold } = cumulatives;
      draftState.hot = hot;
      draftState.cold = cold;
      draftState.isLoading = false;
    },
  },
  fetchFail: () => {},
};

const extraReducers = (builder: ActionReducerMapBuilder<DetailCumulativeBreachSliceState>) => {
  builder.addCase(DetailAction.flush, draftState => {
    draftState.hot = null;
    draftState.cold = null;
    draftState.isLoading = false;
  });
};

const { actions: DetailCumulativeAction, reducer: DetailCumulativeReducer } = createSlice({
  initialState,
  reducers,
  extraReducers,
  name: REDUCER.DETAIL_CUMULATIVE_BREACH,
});

const getSliceState = ({
  sensorDetail: { detailCumulative },
}: RootState): DetailCumulativeBreachSliceState => {
  return detailCumulative;
};

const coldCumulative = (state: RootState, { formatter }: { formatter: FormatService }): string => {
  const { cold } = getSliceState(state);
  return cold ? formatter.listCumulativeBreach(cold) : '';
};

const hotCumulative = (state: RootState, { formatter }: { formatter: FormatService }): string => {
  const { hot } = getSliceState(state);
  return hot ? formatter.listCumulativeBreach(hot) : '';
};

const isLoading = (state: RootState): boolean => {
  const { isLoading: load } = getSliceState(state);
  return load;
};

const DetailCumulativeSelector = {
  coldCumulative,
  hotCumulative,
  isLoading,
};

function* fetch({
  payload: { from, to, sensorId },
}: PayloadAction<UpdateDataPayload>): SagaIterator {
  const breachManager: CumulativeBreachManager = yield call(
    getDependency,
    'cumulativeBreachManager'
  );

  try {
    const cumulative: CumulativeBreachLookup = yield call(
      breachManager.getCumulativeExposure,
      from,
      to,
      sensorId
    );
    yield put(DetailCumulativeAction.fetchSuccess(sensorId, cumulative));
  } catch (error) {
    yield put(DetailCumulativeAction.fetchFail());
  }
}

function* tryFetch(): SagaIterator {
  const id = yield select(DetailSelector.sensorId);
  const { from, to } = yield select(DetailSelector.fromTo);
  yield put(DetailCumulativeAction.fetch(id, from, to));
}

function* root(): SagaIterator {
  yield takeLatest(DetailCumulativeAction.init, tryFetch);
  yield takeLatest(DetailAction.updateDateRange, tryFetch);
  yield takeLatest(DetailCumulativeAction.fetch, fetch);
}

const DetailCumulativeSaga = { root, tryFetch, fetch };

export {
  DetailCumulativeAction,
  DetailCumulativeReducer,
  DetailCumulativeSaga,
  DetailCumulativeSelector,
};
