/* eslint-disable camelcase */
import { takeEvery, getContext, call, put, select } from 'redux-saga/effects';
import { createSlice } from '@reduxjs/toolkit';
import { DEPENDENCY, REDUCER } from '~constants';
import { DetailAction, DetailSelector } from '../Detail';

const initialState = {
  data: [],
  offset: 0,
  limit: 50,
  isLoading: false,
};

const reducers = {
  fetch: {
    prepare: (id, from, to) => ({ payload: { from, to, id } }),
    reducer: draftState => {
      draftState.isLoading = true;
      draftState.data = [];
      draftState.offset = 0;
    },
  },
  fetchSuccess: {
    prepare: data => ({ payload: { data } }),
    reducer: (draftState, { payload: { data } }) => {
      const { limit, offset } = draftState;
      draftState.data = data;
      draftState.isLoading = false;
      draftState.offset = offset + limit;
    },
  },
  fetchFail: () => {},

  fetchMore: { prepare: (from, to, id) => ({ payload: { from, to, id } }), reducer: () => {} },
  fetchMoreSuccess: {
    prepare: logs => ({ payload: { logs } }),
    reducer: (draftState, { payload: { logs } }) => {
      const { limit, offset } = draftState;
      draftState.data = draftState.data.concat(logs);
      draftState.offset = offset + limit;
    },
  },
  fetchMoreFail: () => {},
};

const extraReducers = {
  // eslint-disable-next-line no-unused-vars
  [DetailAction.flush]: draftState => {
    // eslint-disable-next-line no-param-reassign
    draftState = initialState;
  },
};

const { actions: LogTableAction, reducer: LogTableReducer } = createSlice({
  initialState,
  reducers,
  extraReducers,
  name: REDUCER.LOG_TABLE,
});

const LogTableSelector = {
  data({ sensorDetail: { logTable } }) {
    return logTable.data;
  },
  isLoading({ sensorDetail: { logTable } }) {
    return logTable.isLoading;
  },
  pagination({ sensorDetail: { logTable } }) {
    const { limit, offset } = logTable;
    return { limit, offset };
  },
};

function* fetchMore({ payload: { from, to, sensorId } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const logTableManager = yield call(DependencyLocator.get, DEPENDENCY.LOG_TABLE_MANAGER);

  const pagination = yield select(LogTableSelector.pagination);

  try {
    const logs = yield call(logTableManager.getLogs, from, to, sensorId, pagination);
    yield put(LogTableAction.fetchMoreSuccess(logs));
  } catch (error) {
    yield put(LogTableAction.fetchMoreFail());
  }
}

function* fetch({ payload: { from, to, sensorId, id } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const logTableManager = yield call(DependencyLocator.get, DEPENDENCY.LOG_TABLE_MANAGER);

  try {
    const logs = yield call(logTableManager.getLogs, from, to, sensorId ?? id);
    yield put(LogTableAction.fetchSuccess(logs));
  } catch (error) {
    yield put(LogTableAction.fetchFail());
  }
}

function* triggerFetch({ payload: { sensorId, from, to } }) {
  const id = yield select(DetailSelector.sensorId);
  yield put(LogTableAction.fetch(sensorId ?? id, from, to));
}

function* root() {
  yield takeEvery(DetailAction.fetchSuccess, triggerFetch);
  yield takeEvery(DetailAction.updateDateRange, triggerFetch);
  yield takeEvery(LogTableAction.fetch, fetch);
  yield takeEvery(LogTableAction.fetchMore, fetchMore);
}

const LogTableSaga = { root };

export { LogTableAction, LogTableReducer, LogTableSaga, LogTableSelector };
