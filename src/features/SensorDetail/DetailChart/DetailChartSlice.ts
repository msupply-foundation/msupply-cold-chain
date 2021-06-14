import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { RootState } from '~store';
import { REDUCER } from '~constants';
import { DetailAction, UpdateDateRangePayload } from '~features/SensorDetail';
import { ChartDataPoint } from '~features/Chart/ChartManager';
import { getDependency } from '~features/utils/saga';
import { ChartSelector } from '~features/Chart';
import { DetailSelector } from '~features/SensorDetail/Detail/DetailSlice';

interface DetailChartSliceState {
  data: ChartDataPoint[];
  isLoading: boolean;
}

const initialState: DetailChartSliceState = {
  data: [],
  isLoading: false,
};
interface FetchDataSuccessPayload {
  data: ChartDataPoint[];
}

const reducers = {
  fetch: {
    prepare: (sensorId: string, from: number, to: number) => ({
      payload: { from, to, sensorId },
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
  data: ({ sensorDetail: { detailChart } }: RootState): ChartDataPoint[] => {
    const { data } = detailChart;
    return data;
  },
  isLoading: ({ sensorDetail: { detailChart } }: RootState): boolean => {
    const { isLoading } = detailChart;
    return isLoading;
  },
};

function* tryFetchUpdate({
  payload: { sensorId, from, to },
}: PayloadAction<UpdateDateRangePayload>): SagaIterator {
  const chartManager = yield call(getDependency, 'chartManager');

  try {
    const result = yield call(chartManager.getLogs, from, to, sensorId);
    yield put(DetailChartAction.fetchSuccess(result));
  } catch (error) {
    yield put(DetailChartAction.fetchFail());
  }
}

function* tryFetch(): SagaIterator {
  try {
    const id = yield select(DetailSelector.sensorId);
    const data = yield select(ChartSelector.listData, { id });
    yield put(DetailChartAction.fetchSuccess(data));
  } catch (error) {
    yield put(DetailChartAction.fetchFail());
  }
}

function* root(): SagaIterator {
  yield takeLatest(DetailAction.init, tryFetch);
  yield takeLatest(DetailAction.updateDateRange, tryFetchUpdate);
}

const DetailChartSaga = { root };

export { DetailChartAction, DetailChartReducer, DetailChartSaga, DetailChartSelector };
