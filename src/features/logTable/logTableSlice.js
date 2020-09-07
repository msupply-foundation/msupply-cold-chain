import { takeEvery, getContext, call, put, select } from 'redux-saga/effects';
import { createSlice } from '@reduxjs/toolkit';
import { SERVICES, REDUCER } from '~constants';

const initialState = {
  logData: [],
  isLoading: false,
  offset: 0,
  limit: 250,
};
const reducers = {
  getMoreLogs: { prepare: (from, to, id) => ({ payload: { from, to, id } }), reducer: () => {} },
  getMoreLogsSuccessful: {
    prepare: logs => ({ payload: { logs } }),
    reducer: (draftState, { payload: { logs } }) => {
      const { limit, offset } = draftState;
      draftState.logData = draftState.logData.concat(logs);
      draftState.offset = offset + limit;
    },
  },
  getMoreLogsFailed: () => {},

  updateLogs: {
    prepare: (from, to, id) => ({ payload: { from, to, id } }),
    reducer: draftState => {
      draftState.isLoading = true;
      draftState.logData = [];
    },
  },
  updateLogsSuccessful: {
    prepare: logData => ({ payload: { logData } }),
    reducer: (draftState, { payload: { logData } }) => {
      const { limit, offset } = draftState;
      draftState.logData = logData;
      draftState.isLoading = false;
      draftState.offset = offset + limit;
    },
  },
  updateLogsFailed: draftState => {
    draftState.isLoading = false;
  },
};

const { actions: LogTableAction, reducer: LogTableReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.LOG_TABLE,
});

const LogTableSelector = {
  logData({ logTable }) {
    return logTable.logData;
  },
  isLoading({ logTable }) {
    return logTable.isLoading;
  },
  pagination({ logTable }) {
    const { limit, offset } = logTable;
    return { limit, offset };
  },
};

function* getMoreLogs({ payload: { from, to, id } }) {
  const getService = yield getContext('getService');
  const logTableManager = yield call(getService, SERVICES.LOG_TABLE_MANAGER);
  const pagination = yield select(LogTableSelector.pagination);

  try {
    const logs = yield call(logTableManager.getLogs, from, to, id, pagination);
    yield put(LogTableAction.getMoreLogsSuccessful(logs));
  } catch (error) {
    yield put(LogTableAction.getMoreLogsFailed());
  }
}

function* updateLogs({ payload: { from, to, id } }) {
  const getService = yield getContext('getService');
  const logTableManager = yield call(getService, SERVICES.LOG_TABLE_MANAGER);

  try {
    const logs = yield call(logTableManager.getLogs, from, to, id);
    yield put(LogTableAction.updateLogsSuccessful(logs));
  } catch (error) {
    yield put(LogTableAction.updateLogsFailed());
  }
}

function* watchLogTableActions() {
  yield takeEvery(LogTableAction.updateLogs, updateLogs);
  yield takeEvery(LogTableAction.getMoreLogs, getMoreLogs);
}

const LogTableSaga = { watchLogTableActions };

export { LogTableAction, LogTableReducer, LogTableSaga, LogTableSelector };
