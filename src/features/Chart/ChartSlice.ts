import { SagaIterator } from '@redux-saga/types';
import moment from 'moment';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getContext, call, put, takeEvery } from 'redux-saga/effects';
import { ChartDataPoint } from './ChartManager';
import { RootState } from './../../common/store/store';
import { DEPENDENCY, REDUCER } from '../../common/constants';

interface ChartSliceState {
  listLoadingById: Record<string, boolean>;
  listDataById: Record<string, ChartDataPoint[]>;
  detailDataPoints: ChartDataPoint[];
}

const initialState: ChartSliceState = {
  listLoadingById: {},
  listDataById: {},
  detailDataPoints: [],
};

interface GetListChartDataPayload {
  sensorId: string;
  from: number;
  to: number;
  dataPoints: number;
}

interface GetListChartDataSuccessfulPayload {
  data: ChartDataPoint[];
  sensorId: string;
}

interface GetDetailChartData {
  from: number;
  to: number;
  sensorId: string;
  dataPoints: number;
}

interface GetListChartDataFailedPayload {
  sensorId: string;
}

interface GetDetailChartDataSuccessfulPayload {
  data: ChartDataPoint[];
}

const reducers = {
  getListChartData: {
    prepare: (sensorId: string, dataPoints = 30) => ({
      payload: {
        from: moment().subtract(3, 'days').unix(),
        to: moment().unix(),
        sensorId,
        dataPoints,
      },
    }),
    reducer: (
      draftState: ChartSliceState,
      { payload: { sensorId } }: PayloadAction<GetListChartDataPayload>
    ) => {
      draftState.listLoadingById[sensorId] = true;
    },
  },
  getListChartDataSuccessful: {
    prepare: (data: ChartDataPoint[], sensorId: string) => ({ payload: { data, sensorId } }),
    reducer: (
      draftState: ChartSliceState,
      { payload: { data, sensorId } }: PayloadAction<GetListChartDataSuccessfulPayload>
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
    prepare: (from: number, to: number, sensorId: string, dataPoints = 30) => ({
      payload: { from, to, sensorId, dataPoints },
    }),
    reducer: (draftState: ChartSliceState) => {
      draftState.detailDataPoints = [];
    },
  },
  getDetailChartDataSuccessful: {
    prepare: (data: ChartDataPoint[]) => ({ payload: { data } }),
    reducer: (
      draftState: ChartSliceState,
      { payload: { data } }: PayloadAction<GetDetailChartDataSuccessfulPayload>
    ) => {
      draftState.detailDataPoints = data;
    },
  },
  getDetailChartDataFailed: () => {},
};

const listData = (
  { chart: { listDataById } }: RootState,
  { id }: { id: string }
): ChartDataPoint[] => {
  return listDataById[id];
};

const detailData = ({ chart: { detailDataPoints } }: RootState): ChartDataPoint[] => {
  return detailDataPoints;
};

const isLoading = ({ chart: { listLoadingById } }: RootState, { id }: { id: string }): boolean => {
  return listLoadingById[id] ?? true;
};

const ChartSelector = {
  listData,
  detailData,
  isLoading,
};

const { actions: ChartAction, reducer: ChartReducer } = createSlice({
  name: REDUCER.CHART,
  reducers,
  initialState,
});

function* getListChartData({
  payload: { sensorId, dataPoints },
}: PayloadAction<GetListChartDataPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const chartManager = yield call(DependencyLocator.get, DEPENDENCY.CHART_MANAGER);

  try {
    const { from, to } = yield call(chartManager.getChartTimestamps, sensorId);
    const result = yield call(chartManager.getLogs, from, to, sensorId, dataPoints);
    yield put(ChartAction.getListChartDataSuccessful(result, sensorId));
  } catch (error) {
    yield put(ChartAction.getListChartDataFailed(sensorId));
  }
}

function* getDetailChartData({
  payload: { from, to, sensorId, dataPoints },
}: PayloadAction<GetDetailChartData>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const chartManager = yield call(DependencyLocator.get, DEPENDENCY.CHART_MANAGER);

  try {
    const result = yield call(chartManager.getLogs, from, to, sensorId, dataPoints);
    yield put(ChartAction.getDetailChartDataSuccessful(result));
  } catch (error) {
    yield put(ChartAction.getDetailChartDataFailed());
  }
}

function* watchChartActions(): SagaIterator {
  yield takeEvery(ChartAction.getListChartData, getListChartData);
  yield takeEvery(ChartAction.getDetailChartData, getDetailChartData);
}

const ChartSaga = { watchChartActions };

export { ChartSaga, ChartAction, ChartReducer, ChartSelector };
