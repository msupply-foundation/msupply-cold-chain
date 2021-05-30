import { Sensor } from '~services/Database';
import { SensorManager } from '~features/Entities';
import { ReportManager } from './ReportManager';
import { SagaIterator } from '@redux-saga/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';
import { call, put, takeEvery } from 'redux-saga/effects';
import { getDependency } from '~features/utils/saga';
import { REDUCER } from '~constants';
import { PreparedAction } from '~common/types/common';

interface ReportSliceState {
  creating: boolean;
}

interface ReportCreationPayload {
  sensorId: string;
  username: string;
  comment: string;
  from: number;
  to: number;
}

const initialState: ReportSliceState = { creating: false };

const reducers = {
  tryCreate: {
    prepare: (
      sensorId: string,
      username: string,
      comment: string,
      from: number,
      to: number
    ): PreparedAction<ReportCreationPayload> => ({
      payload: { sensorId, username, comment, from, to },
    }),
    reducer: (draftState: ReportSliceState) => {
      draftState.creating = true;
    },
  },
  createSuccessful: (draftState: ReportSliceState) => {
    draftState.creating = false;
  },
  createFailed: (draftState: ReportSliceState) => {
    draftState.creating = false;
  },
  tryCreateAndEmail: {
    prepare: (
      sensorId: string,
      username: string,
      comment: string,
      from: number,
      to: number
    ): PreparedAction<ReportCreationPayload> => ({
      payload: { sensorId, username, comment, from, to },
    }),
    reducer: (draftState: ReportSliceState) => {
      draftState.creating = true;
    },
  },
  createAndEmailSuccessful: (draftState: ReportSliceState) => {
    draftState.creating = false;
  },
  createAndEmailFailed: (draftState: ReportSliceState) => {
    draftState.creating = false;
  },
};

const { actions: ReportAction, reducer: ReportReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.REPORT,
});

function* tryCreate({
  payload: { sensorId, username, comment, from, to },
}: PayloadAction<ReportCreationPayload>): SagaIterator {
  const reportManager: ReportManager = yield call(getDependency, 'reportManager');
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');

  try {
    const sensor = yield call(sensorManager.getSensorById, sensorId);

    const writtenPath = yield call(
      reportManager.createAndWriteReport,
      sensor,
      username,
      comment,
      from,
      to
    );
    yield put(ReportAction.createSuccessful());
    ToastAndroid.show(`Report written to ${writtenPath}`, ToastAndroid.SHORT);
  } catch (error) {
    yield put(ReportAction.createFailed());
    ToastAndroid.show('Failed to create report.', ToastAndroid.SHORT);
  }
}

function* tryCreateAndEmail({
  payload: { sensorId, username, comment, from, to },
}: PayloadAction<ReportCreationPayload>): SagaIterator {
  const reportManager: ReportManager = yield call(getDependency, 'reportManager');
  const sensorManager: SensorManager = yield call(getDependency, 'sensorManager');

  try {
    const sensor: Sensor = yield call(sensorManager.getSensorById, sensorId);
    yield call(reportManager.emailReport, sensor, username, comment, from, to);
    yield put(ReportAction.createAndEmailSuccessful());
  } catch (error) {
    yield put(ReportAction.createAndEmailFailed());
  }
}

function* root(): SagaIterator {
  yield takeEvery(ReportAction.tryCreate, tryCreate);
  yield takeEvery(ReportAction.tryCreateAndEmail, tryCreateAndEmail);
}

const ReportSaga = {
  root,
};

const ReportSelector = {};

export { ReportAction, ReportReducer, ReportSaga, ReportSelector };
