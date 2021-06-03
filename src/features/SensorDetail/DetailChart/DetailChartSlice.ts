import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { call, getContext, put, select, takeEvery } from 'redux-saga/effects';
import { RootState } from '../../../common/store/store';
import { ChartDataPoint } from '../../Chart/ChartManager';
import { DEPENDENCY, REDUCER } from '../../../common/constants';
import { FetchSuccessPayload, DetailAction, DetailSelector } from '../Detail/DetailSlice';
import { getDependency } from '~features/utils/saga';
import { ChartSelector } from '~features/Chart';

interface DetailChartSliceState {
  data: ChartDataPoint[];
  numberOfDataPoints: number;
  isLoading: boolean;
}

const initialState: DetailChartSliceState = {
  data: [],
  numberOfDataPoints: 30,
  isLoading: false,
};

interface FetchPayload {
  sensorId: string;
  from: number;
  to: number;
  dataPoints: number;
}

interface FetchDataSuccessPayload {
  data: ChartDataPoint[];
}

const reducers = {
  fetch: {
    prepare: (sensorId: string, from: number, to: number, dataPoints = 30) => ({
      payload: { from, to, sensorId, dataPoints },
    }),
    reducer: (draftState: DetailChartSliceState) => {
      draftState.data = [];
      draftState.isLoading = true;
    },
  },
  fetchSuccess: {
    prepare: (data: ChartDataPoint[]) => ({ payload: { data } }),
    reducer: (
      draftState: DetailChartSliceState,
      { payload: { data } }: PayloadAction<FetchDataSuccessPayload>
    ) => {
      draftState.data = data;
      draftState.isLoading = false;
    },
  },
  fetchFail: () => {},
};

const extraReducers = (builder: ActionReducerMapBuilder<DetailChartSliceState>) => {
  builder.addCase(DetailAction.flush, (draftState: DetailChartSliceState) => {
    draftState.data = [];
    draftState.numberOfDataPoints = 30;
    draftState.isLoading = false;
  });

  builder.addCase(DetailAction.updateDateRange, (draftState: DetailChartSliceState) => {
    draftState.isLoading = true;
  });
};

const { actions: DetailChartAction, reducer: DetailChartReducer } = createSlice({
  name: REDUCER.DETAIL_CHART,
  initialState,
  reducers,
  extraReducers,
});

const DetailChartSelector = {
  numberOfDataPoints: ({ sensorDetail: { detailChart } }: RootState): number => {
    const { numberOfDataPoints } = detailChart;
    return numberOfDataPoints;
  },
  data: ({ sensorDetail: { detailChart } }: RootState): ChartDataPoint[] => {
    const { data } = detailChart;
    return data;
  },
  isLoading: ({ sensorDetail: { detailChart } }: RootState): boolean => {
    const { isLoading } = detailChart;
    return isLoading;
  },
  sensorId: ({ sensorDetail: { detail } }: RootState): string => {
    const { sensorId } = detail;
    return sensorId;
  },
};

function* tryFetch({ payload: { from, to } }: PayloadAction<FetchPayload>): SagaIterator {
  const chartManager = yield call(getDependency, 'chartManager');
  const dataPoints = yield select(DetailChartSelector.numberOfDataPoints);
  const sensorId = yield select(DetailChartSelector.sensorId);

  try {
    const result = yield call(chartManager.getLogs, from, to, sensorId, dataPoints);
    yield put(DetailChartAction.fetchSuccess(result));
  } catch (error) {
    yield put(DetailChartAction.fetchFail());
  }
}

function* hydrate({
  payload: { sensorId },
}: PayloadAction<{ sensorId: string; minFrom: number; maxTo: number }>): SagaIterator {
  try {
    const data = yield select(ChartSelector.listData, { id: sensorId });
    yield put(DetailChartAction.fetchSuccess(data));
  } catch (error) {
    yield put(DetailChartAction.fetchFail());
  }
}

function* root(): SagaIterator {
  yield takeEvery(DetailAction.fetch, hydrate);
  yield takeEvery(DetailAction.updateDateRange, tryFetch);
}

const DetailChartSaga = { root };

export { DetailChartAction, DetailChartReducer, DetailChartSaga, DetailChartSelector };
