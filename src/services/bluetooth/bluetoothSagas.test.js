import { call } from 'redux-saga/effects';
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import {
  startBluetooth,
  watchPassiveDownloading,
  scanForSensors,
  BluetoothServiceWatcher,
  startPassiveDownloading,
  passiveDownloadingTimer,
  downloadTemperatures,
  downloadTemperaturesForSensor,
  stopPassiveDownloading,
} from './bluetoothSagas';
import { BluetoothReducer, BluetoothStateActions, PassiveBluetoothActions } from './bluetoothSlice';
import { SensorsActions, TemperatureLogActions, DatabaseReducer } from '../database/DatabaseSlice';

import {
  PASSIVE_TEMPERATURE_SYNC_STATE,
  TEMPERATURE_SYNC_STATE,
  SERVICES,
  BLUETOOTH_SERVICE,
} from '~constants';

const macAddress = 'DB:56:07:61:C7:13';
const sensors = [{ macAddress }];
const sensorLogs = [{ temperature: 10 }];

const getSensors = jest.fn(async () => sensors);
const downloadLogs = jest.fn(async () => sensorLogs);
const scanForDevices = jest.fn(async () => sensors);
const saveSensors = jest.fn(async () => sensors);

const dbServiceMock = {
  getSensors,
  saveSensors,
};

const btServiceMock = {
  downloadLogs,
  scanForDevices,
};

const getContextMock = jest.fn(contextName => {
  if (contextName !== 'getService') throw new Error();
  return serviceName => {
    switch (serviceName) {
      case SERVICES.BLUETOOTH: {
        return btServiceMock;
      }
      case SERVICES.DATABASE: {
        return dbServiceMock;
      }
      default:
        throw new Error();
    }
  };
});

const getContextProvider = {
  getContext: getContextMock,
};

describe('Bluetooth Sagas: Unit Tests, checking sequential effect calling', () => {
  it('calls BluetoothServiceWatcher effects', () => {
    testSaga(BluetoothServiceWatcher)
      .next()
      .fork(watchPassiveDownloading)

      .next()
      .takeLeading(
        [BluetoothStateActions.downloadTemperatures, BluetoothStateActions.scanForSensors],
        startBluetooth
      )

      .next()
      .takeEvery(BluetoothStateActions.downloadTemperaturesForSensor, downloadTemperaturesForSensor)

      .next()
      .isDone();
  });
  it('calls watchPassiveDownloading effects', () => {
    testSaga(watchPassiveDownloading)
      .next()
      .take(PassiveBluetoothActions.start)

      .next()
      .race({ start: call(startPassiveDownloading), stop: call(stopPassiveDownloading) })

      .next()
      .take(PassiveBluetoothActions.start)

      .next()
      .race({ start: call(startPassiveDownloading), stop: call(stopPassiveDownloading) });
  });
  it('calls startPassiveDownloading effects', () => {
    testSaga(startPassiveDownloading)
      .next()
      .put(PassiveBluetoothActions.start())

      .next()
      .put(BluetoothStateActions.downloadTemperatures())

      .next()
      .fork(passiveDownloadingTimer)

      .next()
      .delay(BLUETOOTH_SERVICE.DEFAULT_PASSIVE_DOWNLOAD_DELAY)

      .next()
      .cancel()

      .next()
      .put(PassiveBluetoothActions.completeTimer());
  });
  it('calls stopPassiveDownloading effects', () => {
    testSaga(stopPassiveDownloading)
      .next()
      .take(PassiveBluetoothActions.stop)

      .next()
      .put(BluetoothStateActions.complete())

      .next()
      .put(PassiveBluetoothActions.completeTimer())

      .next()
      .put(PassiveBluetoothActions.stopped())

      .next()
      .isDone();
  });
  it('calls passiveDownloadingTimer effects', () => {
    testSaga(passiveDownloadingTimer)
      .next()
      .put(PassiveBluetoothActions.startTimer())

      .next()
      .put(PassiveBluetoothActions.decrementTimer())

      .next()
      .delay(BLUETOOTH_SERVICE.DEFAULT_TIMER_DELAY)

      .next()
      .put(PassiveBluetoothActions.decrementTimer())

      .next()
      .delay(BLUETOOTH_SERVICE.DEFAULT_TIMER_DELAY);
  });
  it('calls startBluetooth effects with downloadTemperatures action correctly', () => {
    testSaga(startBluetooth, BluetoothStateActions.downloadTemperatures())
      .next()
      .put(BluetoothStateActions.start())

      .next()
      .call(downloadTemperatures, BluetoothStateActions.downloadTemperatures())

      .next()
      .put(BluetoothStateActions.complete())

      .next()
      .isDone();
  });
  it('calls startBluetooth effects with scanForSensors action correctly', () => {
    testSaga(startBluetooth, BluetoothStateActions.scanForSensors())
      .next()
      .put(BluetoothStateActions.start())

      .next()
      .call(scanForSensors)

      .next()
      .put(BluetoothStateActions.complete())

      .next()
      .isDone();
  });
});

describe(`
    Downloading temperatures action runs through the sequence:
    *startBluetooth 
    -> put(start) 
    -> *downloadTemperatures
    -> puts(downloadTemperaturesForSensor)
    -> *downloadTemperaturesForSensor
    -> put(saveSensorLogs) 
    -> put(complete)
    `, () => {
  it('calls start and complete at some point', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)
      .put(BluetoothStateActions.start())
      .put(BluetoothStateActions.complete())
      .dispatch(BluetoothStateActions.downloadTemperatures())
      .run({ silenceTimeout: true });
  });
  it('calls downloadTemperatures saga at some point', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)
      .call(downloadTemperatures, BluetoothStateActions.downloadTemperatures())
      .dispatch(BluetoothStateActions.downloadTemperatures())
      .run({ silenceTimeout: true });
  });
  it('yields a call to the bt service to download logs', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)
      .call(downloadLogs, macAddress)
      .dispatch(BluetoothStateActions.downloadTemperatures())
      .run({ silenceTimeout: true });
  });
  it('Downloading temperatures action puts an action to save sensor logs', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)
      .put(TemperatureLogActions.saveSensorLogs(sensorLogs, macAddress))
      .dispatch(BluetoothStateActions.downloadTemperatures())
      .run({ silenceTimeout: true });
  });
});

describe(`
    scanForSensors action starts the following sequence in bluetoothSagas:
    -> *startBluetooth
    -> put(start)
    -> *scanForSensors
    -> put(saveSensors)
    -> put(complete)
    `, () => {
  it('Puts a start and complete action', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)
      .put(BluetoothStateActions.start())
      .put(BluetoothStateActions.complete())
      .dispatch(BluetoothStateActions.scanForSensors())
      .silentRun();
  });
  it('Makes a call to scanForSensors', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)
      .call(scanForSensors)
      .dispatch(BluetoothStateActions.scanForSensors())
      .silentRun();
  });
  it('Puts a saveSensors action', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)
      .put(SensorsActions.saveSensors(sensors))
      .dispatch(BluetoothStateActions.scanForSensors())
      .silentRun();
  });
});

describe(`x`, () => {
  it('Puts a download temperatures action at some point', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)
      .put(BluetoothStateActions.downloadTemperatures())
      .dispatch(PassiveBluetoothActions.start())
      .silentRun();
  });
  it('Starts a timer', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)
      .put(PassiveBluetoothActions.startTimer())
      .dispatch(PassiveBluetoothActions.start())
      .silentRun();
  });
  it('completes a timer', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide({
        ...getContextProvider,
        call: ({ fn }, next) => {
          // Delay effect uses call under the hood. This is quite brittle, but works! ...
          // ... essentially if using `delay`, make the delay 1ms for tests.
          if (fn.name === 'delayP') return fn(1);
          return next();
        },
      })

      .put(PassiveBluetoothActions.completeTimer())

      .dispatch(PassiveBluetoothActions.start())

      .silentRun();
  });
  it('completes when stopped', () => {
    return expectSaga(BluetoothServiceWatcher)
      .provide(getContextProvider)

      .put(BluetoothStateActions.complete())
      .put(PassiveBluetoothActions.completeTimer())
      .put(PassiveBluetoothActions.stopped())

      .dispatch(PassiveBluetoothActions.start())
      .dispatch(PassiveBluetoothActions.stop())

      .silentRun();
  });
});

describe('Bluetooth Sagas: downloadTemperaturesForSensor', () => {
  it('Download logs is called with the passed mac address', () => {
    const downloadLogsMock = jest.fn();
    const btService = jest.fn(() => ({ downloadLogs: downloadLogsMock }));
    const pretendAction = { payload: { macAddress } };

    return expectSaga(downloadTemperaturesForSensor, pretendAction)
      .provide({ getContext: () => btService })
      .call(downloadLogsMock, macAddress)
      .silentRun();
  });
  it('Puts an action to save the logs returned by downloadLogs', () => {
    const pretendAction = { payload: { macAddress } };
    const pretendLogs = [{ temperature: 1 }];

    const downloadLogsMock = jest.fn(() => pretendLogs);
    const btService = jest.fn(() => ({ downloadLogs: downloadLogsMock }));

    return expectSaga(downloadTemperaturesForSensor, pretendAction)
      .provide({ getContext: () => btService })
      .put(TemperatureLogActions.saveSensorLogs(pretendLogs, macAddress))
      .silentRun();
  });
  it('alters the state correctly', () => {
    const pretendAction = { payload: { macAddress } };
    const pretendLogs = [{ temperature: 1 }];
    const pretendInitialState = {
      sensors: { sensorIds: [], byId: {} },
      temperatureLogs: { bySensorId: {}, fromDate: null, toDate: null },
    };

    const downloadLogsMock = jest.fn(() => pretendLogs);
    const btService = jest.fn(() => ({ downloadLogs: downloadLogsMock }));

    return expectSaga(downloadTemperaturesForSensor, pretendAction)
      .provide({ getContext: () => btService })
      .withReducer(DatabaseReducer, pretendInitialState)
      .hasFinalState(pretendInitialState)
      .silentRun();
  });
});

describe('BluetoothSagas: downloadTemperatures', () => {
  it('calls getSensors from the db service', () => {
    const pretendSensors = [{ macAddress }];
    const getSensorsMock = jest.fn(() => pretendSensors);
    const dbService = jest.fn(() => ({ getSensors: getSensorsMock }));

    return expectSaga(downloadTemperatures)
      .provide({ getContext: () => dbService })
      .call(getSensorsMock)
      .run();
  });
  it('puts a downloadTemperaturesForSensors action for each sensor returned', () => {
    const anotherMac = 'A';
    const pretendSensors = [{ macAddress }, { macAddress: anotherMac }];
    const getSensorsMock = jest.fn(() => pretendSensors);
    const dbService = jest.fn(() => ({ getSensors: getSensorsMock }));

    return expectSaga(downloadTemperatures)
      .provide({ getContext: () => dbService })
      .put(BluetoothStateActions.downloadTemperaturesForSensor(macAddress))
      .put(BluetoothStateActions.downloadTemperaturesForSensor(anotherMac))
      .run();
  });
});

describe('BluetoothSagas: scanForSensors', () => {
  it('calls scanForDevices on the bluetooth service', () => {
    const pretendReturnedDevices = [{ macAddress }];
    const scanForDevicesMock = () => pretendReturnedDevices;
    const btService = jest.fn(() => ({ scanForDevices: scanForDevicesMock }));

    return expectSaga(scanForSensors)
      .provide({ getContext: () => btService })
      .call(scanForDevicesMock)
      .run();
  });
  it('puts a save sensors action with the resulting sensors', () => {
    const pretendReturnedDevices = [{ macAddress }];
    const scanForDevicesMock = () => pretendReturnedDevices;
    const btService = jest.fn(() => ({ scanForDevices: scanForDevicesMock }));

    return expectSaga(scanForSensors)
      .provide({ getContext: () => btService })
      .put(SensorsActions.saveSensors(pretendReturnedDevices))
      .run();
  });
});

describe('BluetoothSagas: startBluetooth', () => {
  it('calls the correct saga when the action is downloadTemperatures', () => {
    const action = BluetoothStateActions.downloadTemperatures();
    const pretendSensors = [{ macAddress }];
    const getSensorsMock = jest.fn(() => pretendSensors);
    const dbService = jest.fn(() => ({ getSensors: getSensorsMock }));

    return expectSaga(startBluetooth, action)
      .provide({ getContext: () => dbService })
      .call(downloadTemperatures, action)
      .silentRun();
  });
  it('calls the correct saga when the action is scanForSensors', () => {
    const action = BluetoothStateActions.scanForSensors();
    const pretendReturnedDevices = [{ macAddress }];
    const scanForDevicesMock = () => pretendReturnedDevices;
    const btService = jest.fn(() => ({ scanForDevices: scanForDevicesMock }));

    return expectSaga(startBluetooth, action)
      .provide({ getContext: () => btService })
      .call(scanForSensors)
      .silentRun();
  });
});

describe('BluetoothSagas: passiveDownloadingTimer', () => {
  it('decrements the initial state', async () => {
    return expectSaga(passiveDownloadingTimer)
      .withReducer(BluetoothReducer)
      .hasFinalState({
        bluetooth: { state: 'enabled' },
        passiveDownload: {
          state: null,
          timer:
            BLUETOOTH_SERVICE.DEFAULT_PASSIVE_DOWNLOAD_DELAY -
            BLUETOOTH_SERVICE.DEFAULT_TIMER_DELAY,
        },
      })
      .silentRun();
  });
});

describe('BluetoothSagas: startPassiveDownloading', () => {
  it('manipulates the state correctly', async () => {
    return expectSaga(startPassiveDownloading)
      .hasFinalState({
        bluetooth: { state: TEMPERATURE_SYNC_STATE.ENABLED },
        passiveDownload: {
          timer:
            BLUETOOTH_SERVICE.DEFAULT_PASSIVE_DOWNLOAD_DELAY -
            BLUETOOTH_SERVICE.DEFAULT_TIMER_DELAY,
          state: PASSIVE_TEMPERATURE_SYNC_STATE.IN_PROGRESS,
        },
      })
      .withReducer(BluetoothReducer)
      .silentRun();
  });
});

describe('BluetoothSagas: stopPassiveDownloading', () => {
  it('manipulates the state correctly', () => {
    const pretendFinalState = {
      bluetooth: { state: TEMPERATURE_SYNC_STATE.ENABLED },
      passiveDownload: {
        timer: null,
        state: PASSIVE_TEMPERATURE_SYNC_STATE.STOPPED,
      },
    };

    return expectSaga(stopPassiveDownloading)
      .withReducer(BluetoothReducer)
      .hasFinalState(pretendFinalState)
      .dispatch(PassiveBluetoothActions.stop())
      .run();
  });
});
