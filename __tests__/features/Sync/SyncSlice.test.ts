import { SettingAction } from '~features/Entities/Setting';
import { RootReducer } from '~store/RootReducer';
import * as SyncSlice from '~features/Sync/SyncSlice';
import { configureStore } from '@reduxjs/toolkit';
import { expectSaga } from 'redux-saga-test-plan';
import { getContext } from 'redux-saga/effects';
import { DependencyLocator } from '~common/services';
import { call, take } from 'redux-saga/effects';

const getInitialState = () => SyncSlice.initialState;

const getInitialRootState = () => {
  const store = configureStore({
    reducer: RootReducer,
    devTools: false,
  });

  return store.getState();
};

describe('SyncSlice:Reducer', () => {
  it('dispatching countSyncQueueSuccess sets the state correctly', () => {
    const state = getInitialState();
    const action = SyncSlice.SyncAction.countSyncQueueSuccess(10);
    const result = SyncSlice.SyncReducer(state, action);

    expect(result).toEqual({ ...state, syncQueueLength: 10 });
  });

  it('dispatching updateIsSyncing sets the state correctly', () => {
    const state = getInitialState();
    const action = SyncSlice.SyncAction.updateIsSyncing(true);
    const result = SyncSlice.SyncReducer(state, action);

    expect(result).toEqual({ ...state, isSyncing: true });

    const state2 = getInitialState();
    const action2 = SyncSlice.SyncAction.updateIsSyncing(false);
    const result2 = SyncSlice.SyncReducer(state2, action2);

    expect(result2).toEqual({ ...state2, isSyncing: false });
  });
});

describe('SyncSlice:Selector', () => {
  it('getSliceState returns the entire sync slice state from the root state', () => {
    const state = getInitialRootState();
    const slice = SyncSlice.SyncSelector.getSliceState(state);
    expect(slice).toEqual(getInitialState());
  });

  it('getSyncQueueCount returns the amount of records in the sync queue', () => {
    const state = getInitialRootState();
    expect(SyncSlice.SyncSelector.getSyncQueueCount(state)).toEqual(0);

    const updatedState = { ...state, sync: { ...state.sync, syncQueueLength: 20 } };
    expect(SyncSlice.SyncSelector.getSyncQueueCount(updatedState)).toEqual(20);
  });
});

describe('SyncSlice:Saga:Authenticate', () => {
  it('Puts the correct action on success', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncOutManager', {
      login: () => true,
    });

    return expectSaga(
      SyncSlice.SyncSaga.authenticate,
      SyncSlice.SyncAction.authenticate('loginUrl', 'josh', 'password')
    )
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.authenticateSuccess())
      .run();
  });

  it('Puts the correct action on failure', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncOutManager', {
      login: () => {
        throw new Error('JOSH');
      },
    });

    return expectSaga(
      SyncSlice.SyncSaga.authenticate,
      SyncSlice.SyncAction.authenticate('loginUrl', 'josh', 'password')
    )
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.authenticateFailure('JOSH'))
      .run();
  });
});

describe('SyncSlice:Saga:syncSensors', () => {
  it('Puts the correct action on success', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextSensors: () => [],
    });
    depsLocator.register('syncOutManager', {
      syncSensors: () => true,
    });

    return expectSaga(SyncSlice.SyncSaga.syncSensors, SyncSlice.SyncAction.syncSensors('sensorUrl'))
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.syncSensorsSuccess([]))
      .run();
  });

  it('Puts the correct action when the sync queue manager throws an error.', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextSensors: () => {
        throw new Error('JOSH');
      },
    });
    depsLocator.register('syncOutManager', {
      syncSensors: () => true,
    });

    return expectSaga(SyncSlice.SyncSaga.syncSensors, SyncSlice.SyncAction.syncSensors('sensorUrl'))
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.syncSensorsFailure('JOSH'))
      .run();
  });

  it('Puts the correct action when the sync out manager throws an error.', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextSensors: () => [],
    });
    depsLocator.register('syncOutManager', {
      syncSensors: () => {
        throw new Error('JOSH');
      },
    });

    return expectSaga(SyncSlice.SyncSaga.syncSensors, SyncSlice.SyncAction.syncSensors('sensorUrl'))
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.syncSensorsFailure('JOSH'))
      .run();
  });

  it('The successful path of a sensors sync will call next sensors, sync sensors then drop the logs and update the last sync time', () => {
    const dropLogsMock = jest.fn();
    const syncSensorsMock = jest.fn();
    const syncLogs = [{ id: '1' }];
    const nextSensorsMock = jest.fn(() => syncLogs);

    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextSensors: nextSensorsMock,
      dropLogs: dropLogsMock,
    });
    depsLocator.register('syncOutManager', {
      syncSensors: syncSensorsMock,
    });
    depsLocator.register('utilService', {
      now: () => 0,
    });

    return expectSaga(SyncSlice.SyncSaga.root)
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .call(nextSensorsMock)
      .call(syncSensorsMock, 'sensorUrl', syncLogs)
      .call(dropLogsMock, syncLogs)
      .put(SettingAction.update('lastSync', 0))
      .dispatch(SyncSlice.SyncAction.syncSensors('sensorUrl'))
      .silentRun(10);
  });
});

describe('SyncSlice:Saga:syncTemperatureLogs', () => {
  it('Puts the correct action on success', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextTemperatureLogs: () => [],
    });
    depsLocator.register('syncOutManager', {
      syncTemperatureLogs: () => true,
    });

    return expectSaga(
      SyncSlice.SyncSaga.syncTemperatureLogs,
      SyncSlice.SyncAction.syncTemperatureLogs('temperatureLogUrl')
    )
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.syncTemperatureLogsSuccess([]))
      .run();
  });

  it('Puts the correct action when the sync out manager throws an error.', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextTemperatureLogs: () => [],
    });
    depsLocator.register('syncOutManager', {
      syncTemperatureLogs: () => {
        throw new Error('JOSH');
      },
    });

    return expectSaga(
      SyncSlice.SyncSaga.syncTemperatureLogs,
      SyncSlice.SyncAction.syncTemperatureLogs('temperatureUrl')
    )
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.syncTemperatureLogsFailure('JOSH'))
      .run();
  });

  it('The successful path for syncing temperature logs will call nextLogs, syncLogs then drop the sync logs and update the last sync time', () => {
    const dropLogsMock = jest.fn();
    const syncTemperatureLogsMock = jest.fn();
    const syncLogs = [{ id: '1' }];
    const nextTemperatureLogsMock = jest.fn(() => syncLogs);

    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextTemperatureLogs: nextTemperatureLogsMock,
      dropLogs: dropLogsMock,
    });
    depsLocator.register('syncOutManager', {
      syncTemperatureLogs: syncTemperatureLogsMock,
    });
    depsLocator.register('utilService', {
      now: () => 0,
    });

    return expectSaga(SyncSlice.SyncSaga.root)
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .call(nextTemperatureLogsMock)
      .call(syncTemperatureLogsMock, 'temperatureUrl', syncLogs)
      .call(dropLogsMock, syncLogs)
      .put(SettingAction.update('lastSync', 0))
      .dispatch(SyncSlice.SyncAction.syncTemperatureLogs('temperatureUrl'))
      .silentRun(10);
  });
});

describe('SyncSlice:Saga:syncTemperatureBreaches', () => {
  it('Puts the correct action on success', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextTemperatureBreaches: () => [],
    });
    depsLocator.register('syncOutManager', {
      syncTemperatureBreaches: () => true,
    });

    return expectSaga(
      SyncSlice.SyncSaga.syncTemperatureBreaches,
      SyncSlice.SyncAction.syncTemperatureBreaches('temperatureLogUrl')
    )
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.syncTemperatureBreachesSuccess([]))
      .run();
  });

  it('Puts the correct action when the sync out manager throws an error.', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextTemperatureBreaches: () => [],
    });
    depsLocator.register('syncOutManager', {
      syncTemperatureBreaches: () => {
        throw new Error('JOSH');
      },
    });

    return expectSaga(
      SyncSlice.SyncSaga.syncTemperatureBreaches,
      SyncSlice.SyncAction.syncTemperatureBreaches('temperatureBreachUrl')
    )
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.syncTemperatureBreachesFailure('JOSH'))
      .run();
  });

  it('The successful path for syncing temperature breaches will call nextLogs, syncLogs then drop the sync logs and update the last sync time', () => {
    const dropLogsMock = jest.fn();
    const syncTemperatureBreachesMock = jest.fn();
    const syncLogs = [{ id: '1' }];
    const nextTemperatureBreachesMock = jest.fn(() => syncLogs);

    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextTemperatureLogs: nextTemperatureBreachesMock,
      dropLogs: dropLogsMock,
    });
    depsLocator.register('syncOutManager', {
      syncTemperatureLogs: syncTemperatureBreachesMock,
    });
    depsLocator.register('utilService', {
      now: () => 0,
    });

    return expectSaga(SyncSlice.SyncSaga.root)
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .call(nextTemperatureBreachesMock)
      .call(syncTemperatureBreachesMock, 'temperatureBreachUrl', syncLogs)
      .call(dropLogsMock, syncLogs)
      .put(SettingAction.update('lastSync', 0))
      .dispatch(SyncSlice.SyncAction.syncTemperatureLogs('temperatureBreachUrl'))
      .silentRun(10);
  });
});

describe('SyncSlice:Saga:syncAll', () => {
  it('When syncAll action is dispatched, then the sync logs for each data type are fetched, sent and a success action is dispatched for each.', () => {
    const syncLogs: any[] = [];
    const dropLogsMock = jest.fn();
    const syncTemperatureBreachesMock = jest.fn();
    const nextTemperatureBreachesMock = jest.fn(() => syncLogs);
    const syncTemperatureLogsMock = jest.fn();
    const nextTemperatureLogsMock = jest.fn(() => syncLogs);
    const syncSensorMock = jest.fn();
    const nextSensorMock = jest.fn(() => syncLogs);

    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      nextTemperatureLogs: nextTemperatureLogsMock,
      nextSensors: nextSensorMock,
      nextTemperatureBreaches: nextTemperatureBreachesMock,
      dropLogs: dropLogsMock,
    });
    depsLocator.register('syncOutManager', {
      login: jest.fn(),
      syncTemperatureLogs: syncTemperatureLogsMock,
      syncSensors: syncSensorMock,
      syncTemperatureBreaches: syncTemperatureBreachesMock,
    });
    depsLocator.register('utilService', {
      now: () => 0,
    });

    return expectSaga(SyncSlice.SyncSaga.root)
      .provide([[getContext('dependencyLocator'), depsLocator]])

      .call(syncTemperatureBreachesMock, 'temperatureBreachUrl', syncLogs)
      .call(syncTemperatureLogsMock, 'temperatureLogUrl', syncLogs)
      .call(syncSensorMock, 'sensorUrl', syncLogs)

      .call(nextTemperatureLogsMock)
      .call(nextTemperatureBreachesMock)
      .call(nextSensorMock)

      .put(SyncSlice.SyncAction.authenticateSuccess())
      .put(SyncSlice.SyncAction.syncSensorsSuccess(syncLogs))
      .put(SyncSlice.SyncAction.syncTemperatureLogsSuccess(syncLogs))
      .put(SyncSlice.SyncAction.syncTemperatureBreachesSuccess(syncLogs))

      .dispatch(
        SyncSlice.SyncAction.syncAll({
          authUsername: 'josh',
          authPassword: 'josh',
          authUrl: 'authUrl',
          temperatureBreachUrl: 'temperatureBreachUrl',
          temperatureLogUrl: 'temperatureLogUrl',
          sensorUrl: 'sensorUrl',
        })
      )
      .silentRun(10);
  });
});

describe('SyncSlice:SyncSaga:enablePassiveSync', () => {
  it('When dispatching the action to start the scheduler, the sync scheduler saga is spun up', () => {
    const syncLogs: any[] = [];
    const dropLogsMock = jest.fn();
    const syncTemperatureBreachesMock = jest.fn();
    const nextTemperatureBreachesMock = jest.fn(() => syncLogs);
    const syncTemperatureLogsMock = jest.fn();
    const nextTemperatureLogsMock = jest.fn(() => syncLogs);
    const syncSensorMock = jest.fn();
    const nextSensorMock = jest.fn(() => syncLogs);

    const depsLocator = DependencyLocator;
    depsLocator.register('settingManager', {
      getBool: () => true,
      getSyncSettings: () => ({
        authUsername: 'josh',
        authPassword: 'josh',
        authUrl: 'authUrl',
        temperatureBreachUrl: 'temperatureBreachUrl',
        temperatureLogUrl: 'temperatureLogUrl',
        sensorUrl: 'sensorUrl',
      }),
    });

    depsLocator.register('syncQueueManager', {
      nextTemperatureLogs: nextTemperatureLogsMock,
      nextSensors: nextSensorMock,
      nextTemperatureBreaches: nextTemperatureBreachesMock,
      dropLogs: dropLogsMock,
    });
    depsLocator.register('syncOutManager', {
      login: jest.fn(),
      syncTemperatureLogs: syncTemperatureLogsMock,
      syncSensors: syncSensorMock,
      syncTemperatureBreaches: syncTemperatureBreachesMock,
    });
    depsLocator.register('utilService', {
      now: () => 0,
    });

    return expectSaga(SyncSlice.SyncSaga.root)
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .dispatch(SyncSlice.SyncAction.enablePassiveSync())
      .call(syncTemperatureBreachesMock, 'temperatureBreachUrl', syncLogs)
      .call(syncTemperatureLogsMock, 'temperatureLogUrl', syncLogs)
      .call(syncSensorMock, 'sensorUrl', syncLogs)

      .call(nextTemperatureLogsMock)
      .call(nextTemperatureBreachesMock)
      .call(nextSensorMock)

      .put(SyncSlice.SyncAction.authenticateSuccess())
      .put(SyncSlice.SyncAction.syncSensorsSuccess(syncLogs))
      .put(SyncSlice.SyncAction.syncTemperatureLogsSuccess(syncLogs))
      .put(SyncSlice.SyncAction.syncTemperatureBreachesSuccess(syncLogs))
      .call(SyncSlice.SyncSaga.startSyncScheduler)
      .silentRun(10);
  });

  it('is cannceled', async () => {
    const syncLogs: any[] = [];
    const dropLogsMock = jest.fn();
    const syncTemperatureBreachesMock = jest.fn();
    const nextTemperatureBreachesMock = jest.fn(() => syncLogs);
    const syncTemperatureLogsMock = jest.fn();
    const nextTemperatureLogsMock = jest.fn(() => syncLogs);
    const syncSensorMock = jest.fn();
    const nextSensorMock = jest.fn(() => syncLogs);

    const depsLocator = DependencyLocator;
    depsLocator.register('settingManager', {
      getBool: () => true,
      getSyncSettings: () => ({
        authUsername: 'josh',
        authPassword: 'josh',
        authUrl: 'authUrl',
        temperatureBreachUrl: 'temperatureBreachUrl',
        temperatureLogUrl: 'temperatureLogUrl',
        sensorUrl: 'sensorUrl',
      }),
    });

    depsLocator.register('syncQueueManager', {
      nextTemperatureLogs: nextTemperatureLogsMock,
      nextSensors: nextSensorMock,
      nextTemperatureBreaches: nextTemperatureBreachesMock,
      dropLogs: dropLogsMock,
    });
    depsLocator.register('syncOutManager', {
      login: jest.fn(),
      syncTemperatureLogs: syncTemperatureLogsMock,
      syncSensors: syncSensorMock,
      syncTemperatureBreaches: syncTemperatureBreachesMock,
    });
    depsLocator.register('utilService', {
      now: () => 0,
    });

    return await expectSaga(SyncSlice.SyncSaga.enablePassiveSync)
      .provide([[getContext('dependencyLocator'), depsLocator]])
      // .dispatch(SyncSlice.SyncAction.disablePassiveSync)
      .race({
        start: call(SyncSlice.SyncSaga.startSyncScheduler),
        stop: take(SyncSlice.SyncAction.disablePassiveSync),
      })
      .silentRun(10);
  });
});

describe('SyncSlice:SyncSaga:tryTestConnection', () => {
  it('On the happy path, a success action is put', () => {
    const login = jest.fn();
    const depsLocator = DependencyLocator;
    depsLocator.register('syncOutManager', {
      login,
    });

    const action = SyncSlice.SyncAction.tryTestConnection('loginUrl', 'username', 'password');

    return expectSaga(SyncSlice.SyncSaga.tryTestConnection, action)
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .call(login, 'loginUrl', 'username', 'password')
      .put(SyncSlice.SyncAction.testConnectionSuccess())
      .run();
  });

  it('On the unhappy path, a failure action is put', () => {
    const login = jest.fn(() => {
      throw new Error('JOSH');
    });
    const depsLocator = DependencyLocator;
    depsLocator.register('syncOutManager', {
      login,
    });

    const action = SyncSlice.SyncAction.tryTestConnection('loginUrl', 'username', 'password');

    return expectSaga(SyncSlice.SyncSaga.tryTestConnection, action)
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .call(login, 'loginUrl', 'username', 'password')
      .put(SyncSlice.SyncAction.testConnectionFailure('JOSH'))
      .run();
  });
});

describe('SyncSlice:SyncSaga:tryCountSyncQueue', () => {
  it('the happy path when tryCountSyncQueue will correctly set the sync count in state', async () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', { length: () => 12 });

    const result = await expectSaga(SyncSlice.SyncSaga.root)
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .withReducer(SyncSlice.SyncReducer, SyncSlice.initialState)
      .dispatch(SyncSlice.SyncAction.tryCountSyncQueue)
      .silentRun(10);

    return expect(result.storeState.syncQueueLength).toEqual(12);
  });

  it('the unhappy path when tryCountSyncQueue is dispatched will dispatch a failure action', () => {
    const depsLocator = DependencyLocator;
    depsLocator.register('syncQueueManager', {
      length: () => {
        throw new Error('JOSH');
      },
    });

    return expectSaga(SyncSlice.SyncSaga.tryCountSyncQueue)
      .provide([[getContext('dependencyLocator'), depsLocator]])
      .put(SyncSlice.SyncAction.countSyncQueueFailure('JOSH'))
      .silentRun(10);
  });
});
