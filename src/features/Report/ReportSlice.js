import { createSlice } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';
import { call, getContext, put, takeEvery } from 'redux-saga/effects';

import { REDUCER, DEPENDENCY } from '~constants';

const initialState = { creatingReport: false };
const reducers = {
  tryCreate: {
    prepare: (sensorId, username, comment) => ({ payload: { sensorId, username, comment } }),
    reducer: draftState => {
      draftState.creating = true;
    },
  },
  createSuccessful: {
    prepare: () => {},
    reducer: draftState => {
      draftState.creating = false;
    },
  },
  createFailed: draftState => {
    draftState.creating = false;
  },
  tryCreateAndEmail: {
    prepare: (sensorId, username, comment) => ({ payload: { sensorId, username, comment } }),
    reducer: draftState => {
      draftState.creating = true;
    },
  },
  createAndEmailSuccessful: {
    prepare: () => {},
    reducer: draftState => {
      draftState.creating = false;
    },
  },
  createAndEmailFailed: draftState => {
    draftState.creating = false;
  },
};

const { actions: ReportAction, reducer: ReportReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.REPORT,
});

function* tryCreate({ payload: { sensorId, username, comment } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const reportManager = yield call(DependencyLocator.get, DEPENDENCY.REPORT_MANAGER);

  try {
    const sensor = yield call(reportManager.getSensorById, sensorId);
    const sensorStats = yield call(reportManager.getStats, sensorId);
    const sensorReport = yield call(reportManager.getSensorReport, sensorId);
    const logsReport = yield call(reportManager.getLogsReport, sensorId);
    const breachReport = yield call(reportManager.getBreachReport, sensorId);
    const breachConfigReport = yield call(reportManager.breachConfigReport, sensorId);

    const writtenPath = yield call(
      reportManager.writeLogFile,
      sensor,
      sensorReport,
      sensorStats,
      logsReport,
      breachReport,
      breachConfigReport,
      username,
      comment
    );
    yield put(ReportAction.createSuccessful());
    ToastAndroid.show(`Report written to ${writtenPath}`, ToastAndroid.SHORT);
  } catch (error) {
    yield put(ReportAction.createFailed());
    ToastAndroid.show('Failed to create report.', ToastAndroid.SHORT);
  }
}

function* tryCreateAndEmail({ payload: { sensorId, username, comment } }) {
  const DependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const reportManager = yield call(DependencyLocator.get, DEPENDENCY.REPORT_MANAGER);

  try {
    const sensor = yield call(reportManager.getSensorById, sensorId);
    const sensorStats = yield call(reportManager.getStats, sensorId);
    const sensorReport = yield call(reportManager.getSensorReport, sensorId);
    const logsReport = yield call(reportManager.getLogsReport, sensorId);
    const breachReport = yield call(reportManager.getBreachReport, sensorId);
    const breachConfigReport = yield call(reportManager.breachConfigReport, sensorId);

    yield call(
      reportManager.emailLogFile,
      sensor,
      sensorReport,
      sensorStats,
      logsReport,
      breachReport,
      breachConfigReport,
      username,
      comment
    );
    yield put(ReportAction.createAndEmailSuccessful());
  } catch (error) {
    yield put(ReportAction.createAndEmailFailed());
  }
}

function* root() {
  yield takeEvery(ReportAction.tryCreate, tryCreate);
  yield takeEvery(ReportAction.tryCreateAndEmail, tryCreateAndEmail);
}

const ReportSaga = {
  root,
};

const ReportSelector = {};

export { ReportAction, ReportReducer, ReportSaga, ReportSelector };
