import { expectSaga } from 'redux-saga-test-plan';
import { getContext, put } from 'redux-saga/effects';
import {
  DownloadReducer,
  DownloadInitialState,
  DownloadAction,
  DownloadSaga,
} from '~features/Bluetooth';

import { DEPENDENCY } from '~constants';
import { ConsecutiveBreachAction, CumulativeBreachAction } from '~features/Breach';

describe('DownloadReducer', () => {
  it('passiveDownloadingState', () => {
    const state = DownloadReducer(DownloadInitialState, DownloadAction.passiveDownloadingStart());
    expect(state).toEqual({ downloadingById: {}, passiveDownloadEnabled: false, enabled: true });
  });
  it('passiveDownloadingStop', () => {
    const state = DownloadReducer(DownloadInitialState, DownloadAction.passiveDownloadingStop());
    expect(state).toEqual({ downloadingById: {}, passiveDownloadEnabled: false, enabled: false });
  });
  it('downloadStart', () => {
    const state = DownloadReducer(DownloadInitialState, DownloadAction.downloadStart('1'));
    expect(state).toEqual({
      downloadingById: { 1: true },
      passiveDownloadEnabled: false,
      enabled: false,
    });
  });
  it('downloadStart', () => {
    const state = DownloadReducer(DownloadInitialState, DownloadAction.downloadComplete('1'));
    expect(state).toEqual({
      downloadingById: { 1: false },
      passiveDownloadEnabled: false,
      enabled: false,
    });
  });
});

describe('DownloadActions', () => {
  it('', () => {
    const actions = Object.values(DownloadAction).map(actionCreator => actionCreator());
    expect(actions).toMatchSnapshot();
  });
});

describe('DownloadSaga', () => {
  it('tryManualDownloadForSensor: correctly puts actions when a download is possible', () => {
    const mockSensor = { id: '1', macAddress: 'AA:BB:CC:DD:EE:FF', batteryLevel: 90 };
    const sensorManager = {
      getSensorById: () => mockSensor,
      getCanDownload: () => [true],
      getMostRecentLogTime: () => 0,
    };
    const btService = {
      downloadLogsWithRetries: () => [{ temperature: 1 }],
      updateLogIntervalWithRetries: () => {},
    };
    const downloadManager = {
      calculateNumberOfLogsToSave: () => 1,
      createLogs: () => [{ id: '1' }],
      saveLogs: () => [{ id: '1' }],
    };
    const getSensorManager = () => [btService, sensorManager, downloadManager];
    const depsLocator = { get: getSensorManager };

    return expectSaga(DownloadSaga.tryDownloadForSensor, { payload: { sensorId: '1' } })
      .provide([[getContext(DEPENDENCY.LOCATOR), depsLocator]])
      .run()
      .then(({ effects }) => {
        expect(effects.put.length).toBe(5);
        expect(effects.put[0]).toEqual(put(DownloadAction.downloadStart(mockSensor.id)));
        expect(effects.put[1]).toEqual(put(ConsecutiveBreachAction.create(mockSensor)));
        expect(effects.put[2]).toEqual(put(DownloadAction.passiveDownloadForSensorSuccess()));
        expect(effects.put[3]).toEqual(
          put(CumulativeBreachAction.fetchListForSensor(mockSensor.id))
        );
      });
  });
  it('tryManualDownloadForSensor: when cannot download, put fail and complete actions', () => {
    const mockSensor = { id: '1', macAddress: 'AA:BB:CC:DD:EE:FF', batteryLevel: 90 };
    const sensorManager = { getSensorById: () => mockSensor, getCanDownload: () => [false] };
    const btService = {};
    const downloadManager = {};
    const getSensorManager = () => [btService, sensorManager, downloadManager];
    const depsLocator = { get: getSensorManager };

    return expectSaga(DownloadSaga.tryDownloadForSensor, { payload: { sensorId: '1' } })
      .provide([[getContext(DEPENDENCY.LOCATOR), depsLocator]])
      .run()
      .then(result => {
        const { effects } = result;

        expect(effects.put.length).toBe(2);
        expect(effects.put[0]).toEqual(put(DownloadAction.passiveDownloadForSensorFail()));
        expect(effects.put[1]).toEqual(put(DownloadAction.downloadComplete('1')));
      });
  });
  it('tryManualDownloadForSensor: correctly sets the store state when cannot download', () => {
    const mockSensor = { id: '1', macAddress: 'AA:BB:CC:DD:EE:FF', batteryLevel: 90 };
    const sensorManager = { getSensorById: () => mockSensor, getCanDownload: () => [false] };
    const btService = {};
    const downloadManager = {};
    const getSensorManager = () => [btService, sensorManager, downloadManager];
    const depsLocator = { get: getSensorManager };

    return expectSaga(DownloadSaga.tryDownloadForSensor, { payload: { sensorId: '1' } })
      .provide([[getContext(DEPENDENCY.LOCATOR), depsLocator]])
      .withReducer(DownloadReducer)
      .hasFinalState({
        downloadingById: { 1: false },
        passiveDownloadEnabled: false,
        enabled: false,
      })
      .run();
  });
  it('downloadTemperatures', () => {
    const sensorManager = { getSensors: () => [{ id: '1' }, { id: '2' }] };
    const getSensorManager = () => sensorManager;
    const depsLocator = { get: getSensorManager };

    return expectSaga(DownloadSaga.downloadTemperatures, { payload: { sensorId: '1' } })
      .provide([[getContext(DEPENDENCY.LOCATOR), depsLocator]])
      .run()
      .then(({ effects }) => {
        expect(effects.put.length).toEqual(2);
        expect(effects.put[0]).toEqual(put(DownloadAction.tryPassiveDownloadForSensor('1')));
        expect(effects.put[1]).toEqual(put(DownloadAction.tryPassiveDownloadForSensor('2')));
      });
  });
  it('watchPassiveDownloading: starts a passive download', () => {
    const sensorManager = { getSensors: () => [{ id: '1' }, { id: '2' }] };
    const getSensorManager = () => sensorManager;
    const depsLocator = { get: getSensorManager };

    return expectSaga(DownloadSaga.watchPassiveDownloading)
      .provide([[getContext(DEPENDENCY.LOCATOR), depsLocator]])
      .dispatch(DownloadAction.passiveDownloadingStart())
      .call.fn(DownloadSaga.startPassiveDownloading)
      .silentRun(500);
  });
  it('watchPassiveDownloading: stops a passive download', () => {
    const sensorManager = { getSensors: () => [{ id: '1' }, { id: '2' }] };
    const getSensorManager = () => sensorManager;
    const depsLocator = { get: getSensorManager };

    return expectSaga(DownloadSaga.watchPassiveDownloading)
      .provide([[getContext(DEPENDENCY.LOCATOR), depsLocator]])
      .dispatch(DownloadAction.passiveDownloadingStart())
      .call.fn(DownloadSaga.startPassiveDownloading)
      .dispatch(DownloadAction.passiveDownloadingStop())
      .run();
  });
});
