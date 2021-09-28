import { SagaIterator } from '@redux-saga/types';
import { takeEvery, getContext, call, put, select } from 'redux-saga/effects';
import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { RootState } from '../../../common/store/store';
import { DEPENDENCY, REDUCER } from '../../../common/constants';
import { DetailAction, DetailSelector } from '../Detail';
import { TemperatureLogRow, PaginationConfig, LogTableManager } from './LogTableManager';

export type SortKey = 'timestamp' | 'temperature' | 'isInBreach';
export type SortDirection = 'asc' | 'desc';
export interface SortConfig {
  sortKey: SortKey;
  sortDirection: SortDirection;
}
interface LogTableSliceState {
  data: TemperatureLogRow[];
  offset: number;
  limit: number;
  isLoading: boolean;
  sortKey: SortKey;
  sortDirection: SortDirection;
}

const initialState: LogTableSliceState = {
  data: [],
  offset: 0,
  limit: 50,
  isLoading: false,
  sortKey: 'timestamp',
  sortDirection: 'desc',
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

const getNewSortDirection = (
  currentSortKey: SortKey,
  newSortKey: SortKey,
  currentDirection: SortDirection
): SortDirection => {
  const sameKey = currentSortKey === newSortKey;

  // If it's the same key, then just swap the direction.
  if (sameKey) {
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    return newDirection;
  }

  // Otherwise, start it off asc
  return 'asc';
};

const reducers = {
  init: () => {},
  trySortData: {
    prepare: (sortKey: SortKey) => ({ payload: { sortKey } }),
    reducer: (
      draftState: LogTableSliceState,
      { payload: { sortKey } }: { payload: { sortKey: SortKey } }
    ) => {
      draftState.offset = 0;
      draftState.limit = 50;
      draftState.data = [];
      draftState.isLoading = true;
      draftState.sortDirection = getNewSortDirection(
        draftState.sortKey,
        sortKey,
        draftState.sortDirection
      );
      draftState.sortKey = sortKey;
    },
  },
  sortDataSuccess: {
    prepare: (data: TemperatureLogRow[]) => ({ payload: { data } }),
    reducer: (
      draftState: LogTableSliceState,
      { payload: { data } }: { payload: { data: TemperatureLogRow[] } }
    ) => {
      draftState.data = data;
    },
  },
  sortDataFailure: {
    prepare: (errorMessage: string): { payload: { errorMessage: string } } => ({
      payload: { errorMessage },
    }),
    reducer: () => {},
  },
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
      draftState.data = data;
      draftState.isLoading = false;
    },
  },
  fetchFail: {
    prepare: (errorMessage: string): { payload: { errorMessage: string } } => ({
      payload: { errorMessage },
    }),
    reducer: () => {},
  },

  fetchMore: {
    prepare: (id: string) => ({ payload: { id } }),
    reducer: (draftState: LogTableSliceState) => {
      const { limit, offset } = draftState;
      draftState.offset = offset + limit;
    },
  },
  fetchMoreSuccess: {
    prepare: (logs: TemperatureLogRow[]) => ({ payload: { logs } }),
    reducer: (
      draftState: LogTableSliceState,
      { payload: { logs } }: PayloadAction<FetchMoreSuccess>
    ) => {
      draftState.data = draftState.data.concat(logs);
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
  sortConfig({ sensorDetail: { logTable } }: RootState): SortConfig {
    const { sortKey, sortDirection } = logTable;
    return { sortKey, sortDirection };
  },
};

function* fetchMore({ payload: { id } }: PayloadAction<FetchPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const logTableManager = yield call(DependencyLocator.get, DEPENDENCY.LOG_TABLE_MANAGER);

  const { from, to } = yield select(DetailSelector.fromTo);
  const pagination = yield select(LogTableSelector.pagination);
  const sortConfig = yield select(LogTableSelector.sortConfig);

  try {
    const logs = yield call(logTableManager.getLogs, from, to, id, pagination, sortConfig);
    yield put(LogTableAction.fetchMoreSuccess(logs));
  } catch (error) {
    yield put(LogTableAction.fetchMoreFail());
  }
}

function* fetch({ payload: { from, to, id } }: PayloadAction<FetchPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const logTableManager = yield call(DependencyLocator.get, DEPENDENCY.LOG_TABLE_MANAGER);

  try {
    const sensorId = yield select(DetailSelector.sensorId);
    const logs = yield call(logTableManager.getLogs, from, to, id ?? sensorId);

    yield put(LogTableAction.fetchSuccess(logs));
  } catch (error) {
    yield put(LogTableAction.fetchFail(error.message));
  }
}

function* tryFetch(): SagaIterator {
  const id = yield select(DetailSelector.sensorId);
  const { from, to } = yield select(DetailSelector.fromTo);
  yield put(LogTableAction.fetch(id, from, to));
}

function* trySortData(): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const logTableManager: LogTableManager = yield call(
    DependencyLocator.get,
    DEPENDENCY.LOG_TABLE_MANAGER
  );

  try {
    const sensorId: string = yield select(DetailSelector.sensorId);
    const sortConfig: SortConfig = yield select(LogTableSelector.sortConfig);
    const { from, to } = yield select(DetailSelector.fromTo);
    const paginationConfig: PaginationConfig = yield select(LogTableSelector.pagination);

    const logs: TemperatureLogRow[] = yield call(
      logTableManager.getLogs,
      from,
      to,
      sensorId,
      paginationConfig,
      sortConfig
    );

    yield put(LogTableAction.sortDataSuccess(logs));
  } catch (error) {
    yield put(LogTableAction.sortDataFailure(error.message));
  }
}

function* root(): SagaIterator {
  yield takeEvery(LogTableAction.init, tryFetch);
  yield takeEvery(DetailAction.updateDateRange, tryFetch);
  yield takeEvery(LogTableAction.fetch, fetch);
  yield takeEvery(LogTableAction.fetchMore, fetchMore);
  yield takeEvery(LogTableAction.trySortData, trySortData);
}

const LogTableSaga = { root };

export { LogTableAction, LogTableReducer, LogTableSaga, LogTableSelector };
