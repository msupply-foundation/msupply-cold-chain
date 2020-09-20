import { createSelector, createSlice } from '@reduxjs/toolkit';
import moment from 'moment';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';
import { MILLISECONDS, DEPENDENCY, REDUCER } from '~constants';

const initialState = {
  id: '',
  from: 0,
  to: 0,
  isLoading: false,
  possibleFrom: 0,
  possibleTo: 0,
};

const reducers = {
  updateDateRange: {
    prepare: (from, to) => ({ payload: { from, to } }),
    reducer: (draftState, { payload: { from, to } }) => {
      draftState.from = from;
      draftState.to = to;
    },
  },
  flush: draftState => {
    draftState.id = initialState.id;
    draftState.from = initialState.from;
    draftState.to = initialState.to;
    draftState.isLoading = initialState.isLoading;
  },
  fetch: {
    prepare: sensorId => ({ payload: { sensorId } }),
    reducer: (draftState, { sensorId }) => {
      draftState.isLoading = true;
      draftState.id = sensorId;
    },
  },
  fetchSuccess: {
    prepare: (sensorId, from, to, possibleFrom, possibleTo) => ({
      payload: { sensorId, from, to, possibleFrom, possibleTo },
    }),
    reducer: (draftState, { payload: { sensorId, from, to, possibleFrom, possibleTo } }) => {
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

const selectTo = ({ sensorDetail: { detail } }) => {
  const { to } = detail;
  return to;
};

const selectFrom = ({ sensorDetail: { detail } }) => {
  const { from } = detail;
  return from;
};

const fromToRange = createSelector([selectFrom, selectTo], (from, to) => {
  const options = { allDay: true };
  return moment(from * MILLISECONDS.ONE_SECOND).twix(to * MILLISECONDS.ONE_SECOND, options);
});

const DetailSelector = {
  from: selectFrom,
  to: selectTo,
  fromToRange,
  possibleFromTo: ({ sensorDetail: { detail } }) => {
    const { possibleFrom, possibleTo } = detail;
    return { possibleFrom: possibleFrom * 1000, possibleTo: possibleTo * 1000 };
  },

  sensorId: ({ sensorDetail: { detail } }) => {
    const { sensorId } = detail;
    return sensorId;
  },
  isLoading: ({ sensorDetail: { detail } }) => {
    const { isLoading } = detail;
    return isLoading;
  },
};

function* fetch({ payload: { sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const sensorManager = yield call(DependencyLocator.get, DEPENDENCY.SENSOR_MANAGER);

  try {
    const { possibleFrom, possibleTo, from, to } = yield call(
      sensorManager.getSensorState,
      sensorId
    );

    yield put(DetailAction.fetchSuccess(sensorId, from, to, possibleFrom, possibleTo));
  } catch (error) {
    yield put(DetailAction.fetchFail(sensorId));
  }
}

function* root() {
  yield takeEvery(DetailAction.fetch, fetch);
}

const DetailSaga = { root };

export { DetailAction, DetailReducer, DetailSelector, DetailSaga };
