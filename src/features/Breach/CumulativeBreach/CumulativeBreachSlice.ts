import { SagaIterator } from '@redux-saga/types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';
import { DEPENDENCY, REDUCER } from '../../../common/constants';
import { FormatService } from '../../../common/services';
import { RootState } from '../../../common/store/store';

interface CumulativeBreach {
  hot: TemperatureCumulativeBreach;
  cold: TemperatureCumulativeBreach;
}

interface TemperatureCumulativeBreach {
  duration: number;
  minimumTemperature: number;
  maximumTemperature: number;
}

interface CumulativeBreachSliceState {
  listById: Record<string, CumulativeBreach>;
  detail: CumulativeBreach | null;
}

interface FetchListForSensorPayload {
  sensorId: string;
}

interface FetchDetailForSensorPayload {
  from: number;
  to: number;
  sensorId: string;
}

interface FetchListForSensorSuccessPayload {
  sensorId: string;
  cumulative: CumulativeBreach;
}

interface FetchDetailForSensorSuccessPayload {
  cumulative: CumulativeBreach;
}

const initialState: CumulativeBreachSliceState = {
  listById: {},
  detail: null,
};

const reducers = {
  fetchListForSensor: {
    prepare: (sensorId: string) => ({ payload: { sensorId } }),
    reducer: () => {},
  },
  fetchListForSensorSuccess: {
    prepare: (sensorId: string, cumulative: CumulativeBreach) => ({
      payload: { sensorId, cumulative },
    }),
    reducer: (
      draftState: CumulativeBreachSliceState,
      { payload: { sensorId, cumulative } }: PayloadAction<FetchListForSensorSuccessPayload>
    ) => {
      draftState.listById[sensorId] = cumulative;
    },
  },
  fetchListForSensorFail: () => {},

  fetchDetailForSensor: {
    prepare: (from: number, to: number, sensorId: string) => ({ payload: { sensorId, from, to } }),
    reducer: (draftState: CumulativeBreachSliceState) => {
      draftState.detail = null;
    },
  },
  fetchDetailForSensorSuccess: {
    prepare: (sensorId: string, cumulative: CumulativeBreach) => ({
      payload: { sensorId, cumulative },
    }),
    reducer: (
      draftState: CumulativeBreachSliceState,
      { payload: { cumulative } }: PayloadAction<FetchDetailForSensorSuccessPayload>
    ) => {
      draftState.detail = cumulative;
    },
  },
  fetchDetailForSensorFail: () => {},
};

const { actions: CumulativeBreachAction, reducer: CumulativeBreachReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.CUMULATIVE_BREACH,
});

const detailColdCumulative = (
  { breach: { cumulative } }: RootState,
  { formatter }: { formatter: FormatService }
): string => {
  const { detail } = cumulative;
  const { cold } = detail ?? {};

  return cold ? formatter.listCumulativeBreach(cold) : '';
};

const detailHotCumulative = (
  { breach: { cumulative } }: RootState,
  { formatter }: { formatter: FormatService }
): string => {
  const { detail } = cumulative;
  const { hot } = detail ?? {};

  return hot ? formatter.listCumulativeBreach(hot) : '';
};

const listColdCumulative = (
  { breach: { cumulative } }: RootState,
  { id, formatter }: { id: string; formatter: FormatService }
): string => {
  const { listById } = cumulative;
  const { [id]: listCumulative } = listById;
  const { cold } = listCumulative ?? {};

  return cold ? formatter.listCumulativeBreach(cold) : '';
};

const listHotCumulative = (
  { breach: { cumulative } }: RootState,
  { id, formatter }: { id: string; formatter: FormatService }
): string => {
  const { listById } = cumulative;
  const { [id]: listCumulative } = listById;
  const { hot } = listCumulative ?? {};

  return hot ? formatter.listCumulativeBreach(hot) : '';
};

const CumulativeBreachSelector = {
  detailColdCumulative,
  detailHotCumulative,
  listColdCumulative,
  listHotCumulative,
};

function* fetchListForSensor({
  payload: { sensorId },
}: PayloadAction<FetchListForSensorPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const [breachManager, chartManager] = yield call(DependencyLocator.get, [
    DEPENDENCY.CUMULATIVE_BREACH_MANAGER,
    DEPENDENCY.CHART_MANAGER,
  ]);

  try {
    const { from, to } = yield call(chartManager.getChartTimestamps, sensorId);
    const cumulative = yield call(breachManager.getCumulativeExposure, from, to, sensorId);
    yield put(CumulativeBreachAction.fetchListForSensorSuccess(sensorId, cumulative));
  } catch (error) {
    yield put(CumulativeBreachAction.fetchListForSensorFail());
  }
}

function* fetchDetailForSensor({
  payload: { from, to, sensorId },
}: PayloadAction<FetchDetailForSensorPayload>): SagaIterator {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const breachManager = yield call(DependencyLocator.get, DEPENDENCY.CUMULATIVE_BREACH_MANAGER);

  try {
    const cumulative = yield call(breachManager.getCumulativeExposure, from, to, sensorId);
    yield put(CumulativeBreachAction.fetchDetailForSensorSuccess(sensorId, cumulative));
  } catch (error) {
    yield put(CumulativeBreachAction.fetchDetailForSensorFail());
  }
}

function* root(): SagaIterator {
  yield takeEvery(CumulativeBreachAction.fetchListForSensor, fetchListForSensor);
  yield takeEvery(CumulativeBreachAction.fetchDetailForSensor, fetchDetailForSensor);
}

const CumulativeBreachSaga = { root, fetchDetailForSensor, fetchListForSensor };

export {
  CumulativeBreachAction,
  CumulativeBreachReducer,
  CumulativeBreachSaga,
  CumulativeBreachSelector,
};
