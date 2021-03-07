import { SagaIterator } from '@redux-saga/types';
import { takeEvery, getContext, call, put, select } from 'redux-saga/effects';
import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { RootState } from '../../../common/store/store';
import { DEPENDENCY, REDUCER } from '../../../common/constants';
import { DetailAction, DetailSelector } from '../Detail';
import { TemperatureLogRow, PaginationConfig } from './LogTableManager';

interface LogTableSliceState {
  data: TemperatureLogRow[];
  offset: number;
  limit: number;
  isLoading: boolean;
}

const initialState: LogTableSliceState = {
  data: [],
  offset: 0,
  limit: 50,
  isLoading: false,
};

interface FetchPayload {
  from: number;
  to: number;
  id: string;
}

interface FetchSuccessPayload {
  data: TemperatureLogRow[];
}

interface FetchMoreSuccess {
  logs: TemperatureLogRow[];
}

const reducers = {
  fetch: {
    prepare: (id: string, from: number, to: number) => ({ payload: { from, to, id } }),
    reducer: (draftState: LogTableSliceState) => {
      draftState.isLoading = true;
      draftState.data = [];
      draftState.offset = 0;
    },
  },
  fetchSuccess: {
    prepare: (data: TemperatureLogRow[]) => ({ payload: { data } }),
    reducer: (
      draftState: LogTableSliceState,
      { payload: { data } }: PayloadAction<FetchSuccessPayload>
    ) => {
      const { limit, offset } = draftState;
      draftState.data = data;
      draftState.isLoading = false;
      draftState.offset = offset + limit;
    },
  },
  fetchFail: () => {},

  fetchMore: {
    prepare: (from: number, to: number, id: string) => ({ payload: { from, to, id } }),
    reducer: () => {},
  },
  fetchMoreSuccess: {
    prepare: (logs: TemperatureLogRow[]) => ({ payload: { logs } }),
    reducer: (
      draftState: LogTableSliceState,
      { payload: { logs } }: PayloadAction<FetchMoreSuccess>
    ) => {
      const { limit, offset } = draftState;
      draftState.data = draftState.data.concat(logs);
      draftState.offset = offset + limit;
    },
  },
  fetchMoreFail: () => {},
};

const extraReducers = (builder: ActionReducerMapBuilder<LogTableSliceState>) => {
  builder.addCase(DetailAction.flush, draftState => {
    draftState.data = [];
    draftState.offset = 0;
    draftState.limit = 50;
    draftState.isLoading = false;
  });
};

const { actions: LogTableAction, reducer: LogTableReducer } = createSlice({
  initialState,
  reducers,
  extraReducers,
  name: REDUCER.LOG_TABLE,
});

const LogTableSelector = {
  data({ sensorDetail: { logTable } }: RootState): TemperatureLogRow[] {
    return logTable.data;
  },
  isLoading({ sensorDetail: { logTable } }: RootState): boolean {
    return logTable.isLoading;
  },
  pagination({ sensorDetail: { logTable } }: RootState): PaginationConfig {
    const { limit, offset } = logTable;
    return { limit, offset };
  },
};

function* fetchMore({ payload: { from, to, id } }: PayloadAction<FetchPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const logTableManager = yield call(DependencyLocator.get, DEPENDENCY.LOG_TABLE_MANAGER);

  const pagination = yield select(LogTableSelector.pagination);

  try {
    const logs = yield call(logTableManager.getLogs, from, to, id, pagination);
    yield put(LogTableAction.fetchMoreSuccess(logs));
  } catch (error) {
    yield put(LogTableAction.fetchMoreFail());
  }
}

function* fetch({ payload: { from, to, id } }: PayloadAction<FetchPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const logTableManager = yield call(DependencyLocator.get, DEPENDENCY.LOG_TABLE_MANAGER);

  try {
    const logs = yield call(logTableManager.getLogs, from, to, id);
    yield put(LogTableAction.fetchSuccess(logs));
  } catch (error) {
    yield put(LogTableAction.fetchFail());
  }
}

function* tryFetch({
  payload: { from, to },
}: PayloadAction<{ from: number; to: number }>): SagaIterator {
  const id = yield select(DetailSelector.sensorId);
  yield put(LogTableAction.fetch(id, from, to));
}

function* root() {
  yield takeEvery(DetailAction.fetchSuccess, tryFetch);
  yield takeEvery(DetailAction.updateDateRange, tryFetch);
  yield takeEvery(LogTableAction.fetch, fetch);
  yield takeEvery(LogTableAction.fetchMore, fetchMore);
}

const LogTableSaga = { root };

export { LogTableAction, LogTableReducer, LogTableSaga, LogTableSelector };
