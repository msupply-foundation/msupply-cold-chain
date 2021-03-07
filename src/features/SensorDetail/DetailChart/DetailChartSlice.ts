import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { call, getContext, put, select, takeEvery } from 'redux-saga/effects';
import { RootState } from '../../../common/store/store';
import { ChartDataPoint } from '../../Chart/ChartManager';
import { DEPENDENCY, REDUCER } from '../../../common/constants';
import { FetchSuccessPayload, DetailAction, DetailSelector } from '../Detail/DetailSlice';

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
};

const { actions: DetailChartAction, reducer: DetailChartReducer } = createSlice({
  name: REDUCER.DETAIL_CHART,
  initialState,
  reducers,
  extraReducers,
});

interface Selector {
  numberOfDataPoints(state: RootState): number;
}

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
};

function* fetch({ payload: { from, to, sensorId } }: PayloadAction<FetchPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const chartManager = yield call(DependencyLocator.get, DEPENDENCY.CHART_MANAGER);

  const dataPoints = yield select(DetailChartSelector.numberOfDataPoints);

  try {
    const result = yield call(chartManager.getLogs, from, to, sensorId, dataPoints);
    yield put(DetailChartAction.fetchSuccess(result));
  } catch (error) {
    yield put(DetailChartAction.fetchFail());
  }
}

function* tryFetch({
  payload: { sensorId, from, to },
}: PayloadAction<FetchPayload | FetchSuccessPayload>): SagaIterator {
  const id = yield select(DetailSelector.sensorId);
  yield put(DetailChartAction.fetch(sensorId ?? id, from, to));
}

function* root(): SagaIterator {
  yield takeEvery(DetailChartAction.fetch, fetch);
  yield takeEvery(DetailAction.fetchSuccess, tryFetch);
  yield takeEvery(DetailAction.updateDateRange, tryFetch);
}

const DetailChartSaga = { root };

export { DetailChartAction, DetailChartReducer, DetailChartSaga, DetailChartSelector };
