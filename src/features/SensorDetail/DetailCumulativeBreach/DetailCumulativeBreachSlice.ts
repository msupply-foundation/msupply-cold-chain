import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { call, getContext, put, select, takeEvery } from 'redux-saga/effects';
import { RootState } from '../../../common/store/store';
import { DEPENDENCY, REDUCER } from '../../../common/constants';
import { DetailAction, DetailSelector } from '../Detail/DetailSlice';
import {
  CumulativeBreach,
  CumulativeBreachLookup,
} from '../../Breach/CumulativeBreach/CumulativeBreachManager';
import { FormatService } from '../../../common/services';

interface DetailCumulativeBreachSliceState {
  hot: CumulativeBreach | null;
  cold: CumulativeBreach | null;
  isLoading: boolean;
}

const initialState = {
  hot: null,
  cold: null,
  isLoading: false,
};

interface FetchPayload {
  sensorId: string;
  from: number;
  to: number;
}

interface FetchSuccessPayload {
  cumulatives: CumulativeBreachLookup;
  sensorId: string;
}

const reducers = {
  fetch: {
    prepare: (sensorId: string, from: number, to: number) => ({ payload: { sensorId, from, to } }),
    reducer: (draftState: DetailCumulativeBreachSliceState) => {
      draftState.isLoading = true;
    },
  },
  fetchSuccess: {
    prepare: (sensorId: string, cumulatives: CumulativeBreachLookup) => ({
      payload: { cumulatives, sensorId },
    }),
    reducer: (
      draftState: DetailCumulativeBreachSliceState,
      { payload: { cumulatives } }: PayloadAction<FetchSuccessPayload>
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

function* fetch({ payload: { from, to, sensorId } }: PayloadAction<FetchPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.CUMULATIVE_BREACH_MANAGER);

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

function* tryFetch({ payload: { sensorId, from, to } }: PayloadAction<FetchPayload>): SagaIterator {
  const id = yield select(DetailSelector.sensorId);
  yield put(DetailCumulativeAction.fetch(sensorId ?? id, from, to));
}

function* root(): SagaIterator {
  yield takeEvery(DetailAction.initSuccess, tryFetch);
  yield takeEvery(DetailAction.updateDateRange, tryFetch);
  yield takeEvery(DetailCumulativeAction.fetch, fetch);
}

const DetailCumulativeSaga = { root };

export {
  DetailCumulativeAction,
  DetailCumulativeReducer,
  DetailCumulativeSaga,
  DetailCumulativeSelector,
};
