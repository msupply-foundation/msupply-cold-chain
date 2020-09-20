import { createSlice } from '@reduxjs/toolkit';
import { call, getContext, put, select, takeEvery } from 'redux-saga/effects';

import { DEPENDENCY, REDUCER } from '~constants';

import { DetailAction, DetailSelector } from '../Detail/DetailSlice';

const initialState = {
  hot: null,
  cold: null,
  isLoading: false,
};

const reducers = {
  fetch: {
    prepare: (sensorId, from, to) => ({ payload: { sensorId, from, to } }),
    reducer: draftState => {
      draftState.isLoading = true;
    },
  },
  fetchSuccess: {
    prepare: (sensorId, cumulatives) => ({ payload: { cumulatives, sensorId } }),
    reducer: (draftState, { payload: { cumulatives } }) => {
      const { hotCumulative, coldCumulative } = cumulatives;
      draftState.hot = hotCumulative;
      draftState.cold = coldCumulative;
      draftState.isLoading = false;
    },
  },
  fetchFail: () => {},
};

const extraReducers = {
  // eslint-disable-next-line no-unused-vars
  [DetailAction.flush]: draftState => {
    // eslint-disable-next-line no-param-reassign
    draftState = initialState;
  },
};

const { actions: DetailCumulativeAction, reducer: DetailCumulativeReducer } = createSlice({
  initialState,
  reducers,
  extraReducers,
  name: REDUCER.DETAIL_CUMULATIVE_BREACH,
});

const getSliceState = ({ sensorDetail: { detailCumulative } }) => {
  return detailCumulative;
};

const coldCumulative = (state, { formatter }) => {
  const { cold } = getSliceState(state);
  return cold ? formatter.listCumulativeBreach(cold) : '';
};

const hotCumulative = (state, { formatter }) => {
  const { hot } = getSliceState(state);
  return hot ? formatter.listCumulativeBreach(hot) : '';
};

const isLoading = state => {
  const { isLoading: load } = getSliceState(state);
  return load;
};

const DetailCumulativeSelector = {
  coldCumulative,
  hotCumulative,
  isLoading,
};

function* fetch({ payload: { from, to, sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.CUMULATIVE_BREACH_MANAGER);

  try {
    const cumulative = yield call(breachManager.getCumulativeExposure, from, to, sensorId);
    yield put(DetailCumulativeAction.fetchSuccess(sensorId, cumulative));
  } catch (error) {
    yield put(DetailCumulativeAction.fetchFail());
  }
}

function* triggerFetch({ payload: { sensorId, from, to } }) {
  const id = yield select(DetailSelector.sensorId);
  yield put(DetailCumulativeAction.fetch(sensorId ?? id, from, to));
}

function* root() {
  yield takeEvery(DetailAction.fetchSuccess, triggerFetch);
  yield takeEvery(DetailAction.updateDateRange, triggerFetch);
  yield takeEvery(DetailCumulativeAction.fetch, fetch);
}

const DetailCumulativeSaga = { root };

export {
  DetailCumulativeAction,
  DetailCumulativeReducer,
  DetailCumulativeSaga,
  DetailCumulativeSelector,
};
