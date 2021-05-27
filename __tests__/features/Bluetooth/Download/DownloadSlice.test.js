import { expectSaga } from 'redux-saga-test-plan';
import { getContext } from 'redux-saga/effects';
import { DownloadAction } from '~features/Bluetooth';
import * as DownloadSlice from '~features/Bluetooth/Download';
import { ConsecutiveBreachAction, CumulativeBreachAction } from '~features/Breach';
import { DependencyLocator } from '~common/services';

describe('DownloadSlice:DownloadReducer', () => {
  it('Dispatching a passiveDownloadingStart action correctly updates state.', () => {
    const state = DownloadSlice.DownloadReducer(
      DownloadSlice.DownloadInitialState,
      DownloadSlice.DownloadAction.passiveDownloadingStart()
    );
    expect(state).toEqual({
      downloadingById: {},
      passiveDownloadEnabled: false,
      enabled: true,
    });
  });

  it('Dispatching passiveDownloadingStop correctly sets the state', () => {
    const state = DownloadSlice.DownloadReducer(
      DownloadSlice.DownloadInitialState,
      DownloadSlice.DownloadAction.passiveDownloadingStop()
    );
    expect(state).toEqual({ downloadingById: {}, passiveDownloadEnabled: false, enabled: false });
  });

  it('Dispatching a downloadStart action correctly sets the state for the correct id', () => {
    const state = DownloadSlice.DownloadReducer(
      DownloadSlice.DownloadInitialState,
      DownloadSlice.DownloadAction.downloadStart('1')
    );

    expect(state).toEqual({
      downloadingById: { 1: true },
      passiveDownloadEnabled: false,
      enabled: false,
    });
  });

  it('Dispatching a downloadComplete action correctly sets the state for the correct id.', () => {
    const state = DownloadSlice.DownloadReducer(
      DownloadSlice.DownloadInitialState,
      DownloadSlice.DownloadAction.downloadComplete('1')
    );
    expect(state).toEqual({
      downloadingById: { 1: false },
      passiveDownloadEnabled: false,
      enabled: false,
    });
  });
});

describe('DownloadSlice:DownloadSaga:tryDownloadForSensor', () => {
  it('the happy path for trying to download logs for a sensor, will correctly download some logs, try make a breach', () => {
    const macAddress = 'AA:BB:CC:DD:EE:FF';
    const mockSensor = { id: '1', macAddress, batteryLevel: 90, logInterval: 300 };
    const mockLogs = [{ temperature: 1 }];
    const createdLogs = [{ temperature: 1 }];
    const savedLogs = [{ temperature: 1 }];

    const getSensorById = jest.fn(() => mockSensor);
    const downloadLogsWithRetries = jest.fn(() => mockLogs);
    const createLogs = jest.fn(() => createdLogs);
    const saveLogs = jest.fn(() => savedLogs);
    const updateLogIntervalWithRetries = jest.fn();

    DependencyLocator.register('sensorManager', {
      getSensorById,
      getCanDownload: () => [true],
      getMostRecentLogTime: () => 0,
    });
    DependencyLocator.register('bleService', {
      downloadLogsWithRetries,
      updateLogIntervalWithRetries,
    });
    DependencyLocator.register('downloadManager', {
      createLogs,
      saveLogs,
      calculateNumberOfLogsToSave: () => 1,
    });

    return expectSaga(
      DownloadSlice.DownloadSaga.tryDownloadForSensor,
      DownloadSlice.DownloadAction.tryPassiveDownloadForSensor('1')
    )
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .call(getSensorById, '1')
      .call(downloadLogsWithRetries, macAddress, 10, null)
      .call(createLogs, mockLogs, mockSensor, 1, 0)
      .call(saveLogs, createdLogs)
      .call(updateLogIntervalWithRetries, macAddress, 300, 10, null)
      .run();
  });

  it('the happy path for trying to download logs for a sensor, will correctly put the correct actions during the saga', () => {
    const macAddress = 'AA:BB:CC:DD:EE:FF';
    const mockSensor = { id: '1', macAddress, batteryLevel: 90, logInterval: 300 };
    const mockLogs = [{ temperature: 1 }];
    const createdLogs = [{ temperature: 1 }];
    const savedLogs = [{ temperature: 1 }];

    const getSensorById = jest.fn(() => mockSensor);
    const downloadLogsWithRetries = jest.fn(() => mockLogs);
    const createLogs = jest.fn(() => createdLogs);
    const saveLogs = jest.fn(() => savedLogs);
    const updateLogIntervalWithRetries = jest.fn();

    DependencyLocator.register('sensorManager', {
      getSensorById,
      getCanDownload: () => [true],
      getMostRecentLogTime: () => 0,
    });
    DependencyLocator.register('bleService', {
      downloadLogsWithRetries,
      updateLogIntervalWithRetries,
    });
    DependencyLocator.register('downloadManager', {
      createLogs,
      saveLogs,
      calculateNumberOfLogsToSave: () => 1,
    });

    return expectSaga(
      DownloadSlice.DownloadSaga.tryDownloadForSensor,
      DownloadSlice.DownloadAction.tryPassiveDownloadForSensor('1')
    )
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .put(DownloadAction.downloadStart('1'))
      .put(ConsecutiveBreachAction.create(mockSensor))
      .put(DownloadAction.passiveDownloadForSensorSuccess('1'))
      .put(CumulativeBreachAction.fetchListForSensor('1'))
      .put(DownloadAction.downloadComplete('1'))
      .run();
  });

  it('The unhappy path for downloading logs for a sensor correctly puts a fail action', () => {
    const getSensorById = jest.fn(() => {
      throw new Error('JOSH');
    });

    DependencyLocator.register('sensorManager', { getSensorById });
    DependencyLocator.register('bleService', {});
    DependencyLocator.register('downloadManager', {});

    return expectSaga(
      DownloadSlice.DownloadSaga.tryDownloadForSensor,
      DownloadSlice.DownloadAction.tryPassiveDownloadForSensor('1')
    )
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .put(DownloadAction.passiveDownloadForSensorFail('JOSH'))
      .run();
  });
});

describe('SyncSlice:SyncSaga:downloadTemperatures', () => {
  it('A download logs action is put for each sensor', () => {
    DependencyLocator.register('sensorManager', {
      getAll: () => [{ id: '1' }, { id: '2' }, { id: '3' }],
    });

    return expectSaga(DownloadSlice.DownloadSaga.downloadTemperatures)
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .put(DownloadAction.tryPassiveDownloadForSensor('1'))
      .put(DownloadAction.tryPassiveDownloadForSensor('2'))
      .put(DownloadAction.tryPassiveDownloadForSensor('3'))
      .run();
  });
});
