import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from '@redux-saga/types';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';

import { FailurePayload, PrepareActionReturn } from '~common/types/common';
import { HydrateAction } from '~features/Hydrate';
import { RootState } from '~store';
import { REDUCER } from '~constants';
import { getDependency } from '~features/utils/saga';
import {
  ChartDataPoint,
  ChartManager,
  ChartSliceState,
  GetChartDataSuccessfulPayload,
  GetListChartDataFailedPayload,
  GetListChartDataPayload,
} from '~features/Chart';
import { GetDetailChartDataPayload, ListDataById } from '~features/Chart/types';

const initialState: ChartSliceState = {
  listLoadingById: {},
  listDataById: {},
  detailDataPoints: [],
};

const reducers = {
  initSuccess: {
    prepare: (byId: ListDataById): PrepareActionReturn<ListDataById> => ({
      payload: byId,
    }),
    reducer: (draftState: ChartSliceState, { payload }: PayloadAction<ListDataById>) => {
      draftState.listDataById = payload;

      Object.keys(payload).forEach(sensorId => {
        draftState.listLoadingById[sensorId] = false;
      });
    },
  },
  initFailure: {
    prepare: (errorMessage: string): PrepareActionReturn<FailurePayload> => ({
      payload: { errorMessage },
    }),
    reducer: () => {},
  },
  getListChartData: {
    prepare: (sensorId: string): PrepareActionReturn<GetListChartDataPayload> => ({
      payload: { sensorId },
    }),
    reducer: (
      draftState: ChartSliceState,
      { payload: { sensorId } }: PayloadAction<GetListChartDataPayload>
    ) => {
      draftState.listLoadingById[sensorId] = true;
    },
  },
  getListChartDataSuccessful: {
    prepare: (
      data: ChartDataPoint[],
      sensorId: string
    ): PrepareActionReturn<GetChartDataSuccessfulPayload> => ({ payload: { data, sensorId } }),
    reducer: (
      draftState: ChartSliceState,
      { payload: { data, sensorId } }: PayloadAction<GetChartDataSuccessfulPayload>
    ) => {
      draftState.listDataById[sensorId] = data;
      draftState.listLoadingById[sensorId] = false;
    },
  },
  getListChartDataFailed: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: (
      draftState: ChartSliceState,
      { payload: { sensorId } }: PayloadAction<GetListChartDataFailedPayload>
    ) => {
      draftState.listLoadingById[sensorId] = false;
    },
  },
  getDetailChartData: {
    prepare: (
      from: number,
      to: number,
      sensorId: string
    ): PrepareActionReturn<GetDetailChartDataPayload> => ({
      payload: { from, to, sensorId },
    }),
    reducer: (draftState: ChartSliceState) => {
      draftState.detailDataPoints = [];
    },
  },
  getDetailChartDataSuccessful: {
    prepare: (
      sensorId: string,
      data: ChartDataPoint[]
    ): PrepareActionReturn<GetChartDataSuccessfulPayload> => ({ payload: { data, sensorId } }),
    reducer: (
      draftState: ChartSliceState,
      { payload: { data } }: PayloadAction<GetChartDataSuccessfulPayload>
    ) => {
      draftState.detailDataPoints = data;
    },
  },
  getDetailChartDataFailed: () => {},
};

const ChartSelector = {
  listData: ({ chart: { listDataById } }: RootState, { id }: { id: string }): ChartDataPoint[] => {
    return listDataById[id];
  },
  detailData: ({ chart: { detailDataPoints } }: RootState): ChartDataPoint[] => {
    return detailDataPoints;
  },
  isLoading: ({ chart: { listLoadingById } }: RootState, { id }: { id: string }): boolean => {
    return listLoadingById[id] ?? true;
  },
};

const { actions: ChartAction, reducer: ChartReducer } = createSlice({
  name: REDUCER.CHART,
  reducers,
  initialState,
});

function* getListChartData({
  payload: { sensorId },
}: PayloadAction<GetListChartDataPayload>): SagaIterator {
  const chartManager: ChartManager = yield call(getDependency, 'chartManager');

  try {
    const result = yield call(chartManager.getListChartData, sensorId);
    yield put(ChartAction.getListChartDataSuccessful(result, sensorId));
  } catch (error) {
    yield put(ChartAction.getListChartDataFailed(sensorId));
  }
}

function* getAllListChartData(): SagaIterator {
  const chartManager: ChartManager = yield call(getDependency, 'chartManager');

  try {
    const result: ListDataById = yield call(chartManager.getAllListChartData);
    yield put(ChartAction.initSuccess(result));
  } catch (error) {
    yield put(ChartAction.initFailure((error as Error).message));
  }
}

function* getDetailChartData({
  payload: { from, to, sensorId },
}: PayloadAction<GetDetailChartDataPayload>): SagaIterator {
  const chartManager: ChartManager = yield call(getDependency, 'chartManager');

  try {
    const result = yield call(chartManager.getLogs, from, to, sensorId);
    yield put(ChartAction.getDetailChartDataSuccessful(sensorId, result));
  } catch (error) {
    yield put(ChartAction.getDetailChartDataFailed());
  }
}

function* root(): SagaIterator {
  yield takeEvery(ChartAction.getListChartData, getListChartData);
  yield takeEvery(ChartAction.getDetailChartData, getDetailChartData);
  yield takeLatest(HydrateAction.hydrate, getAllListChartData);
}

const ChartSaga = { root, getDetailChartData, getAllListChartData, getListChartData };

export { ChartSaga, ChartAction, ChartReducer, ChartSelector };
