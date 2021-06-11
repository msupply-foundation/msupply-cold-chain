import { expectSaga } from 'redux-saga-test-plan';
import { getContext } from 'redux-saga/effects';
import { DependencyLocator, UtilService } from '~services';
import {
  ProgramReducer,
  ProgramInitialState,
  ProgramAction,
  ProgramSaga,
} from '~features/Bluetooth';
import { SETTING } from '~constants';

describe('ProgramReducer', () => {
  it('Sets state correctly when updating log interval for a sensor is a failure', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.updateLogIntervalFail('A', 300)
    );

    expect(newState).toEqual({ isProgramming: false, programmingByMac: {} });
  });

  it('Sets state correctly when updating log interval for a sensor is successful', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.updateLogIntervalSuccess('A', 300)
    );

    expect(newState).toEqual({ isProgramming: false, programmingByMac: {} });
  });
  it('Sets state correctly when trying to update a log interval for a sensor', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.tryUpdateLogInterval('A', 300)
    );

    expect(newState).toEqual({ isProgramming: true, programmingByMac: {} });
  });
  it('Sets state correctly when programming sensor is successful', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.programNewSensorSuccess('A', 300)
    );

    expect(newState).toEqual({ isProgramming: false, programmingByMac: { A: false } });
  });
  it('Sets state correctly when trying to update the log interval', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.tryUpdateLogInterval('A', 300)
    );

    expect(newState).toEqual({ isProgramming: true, programmingByMac: {} });
  });
  it('Sets state correctly when trying to program', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.tryProgramNewSensor('A', 300)
    );

    expect(newState).toEqual({ programmingByMac: { A: true }, isProgramming: true });
  });
});

describe('ProgramAction', () => {
  it('has matching snapshots', () => {
    const actions = Object.values(ProgramAction).map(action => action());
    expect(actions).toMatchSnapshot();
  });
});

describe('ProgramSaga', () => {
  it('tryUpdateLogInterval: fail with retries', async () => {
    const mockSensor = { id: '1', macAddress: 'AA:BB:CC:DD:EE:FF', batteryLevel: 90 };
    const mockUpdateLogInterval = jest.fn(() => {
      throw new Error();
    });
    const sensorManager = { getSensorByMac: () => mockSensor };
    const btService = { updateLogInterval: mockUpdateLogInterval };

    DependencyLocator.register('sensorManager', sensorManager);
    DependencyLocator.register('bleService', btService);
    DependencyLocator.register('utilService', new UtilService());

    await expectSaga(ProgramSaga.tryUpdateLogInterval, {
      payload: { macAddress: 'AA:BB:CC:DD:EE:FF', logInterval: 300 },
    })
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .run();

    expect(mockUpdateLogInterval).toBeCalledTimes(10);
  });
  it('tryUpdateLogInterval: fail', () => {
    const mockSensor = { id: '1', macAddress: 'AA:BB:CC:DD:EE:FF', batteryLevel: 90 };
    const sensorManager = { getSensorByMac: () => mockSensor };
    const btService = {
      updateLogInterval: () => {
        throw new Error();
      },
    };

    DependencyLocator.register('settingManager', sensorManager);
    DependencyLocator.register('bleService', btService);
    DependencyLocator.register('utilService', new UtilService());

    return expectSaga(ProgramSaga.tryUpdateLogInterval, {
      payload: { macAddress: 'AA:BB:CC:DD:EE:FF', logInterval: 300 },
    })
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .put(ProgramAction.updateLogIntervalFail())
      .run();
  });
  it('tryUpdateLogInterval: success', () => {
    const mockSensor = { id: '1', macAddress: 'AA:BB:CC:DD:EE:FF', batteryLevel: 90 };
    const sensorManager = { getSensorByMac: () => mockSensor };
    const btService = { updateLogInterval: () => {} };

    DependencyLocator.register('settingManager', sensorManager);
    DependencyLocator.register('bleService', btService);
    DependencyLocator.register('utilService', new UtilService());
    // .provide([[getContext('dependencyLocator'), DependencyLocator]])

    return expectSaga(ProgramSaga.tryUpdateLogInterval, {
      payload: { macAddress: 'AA:BB:CC:DD:EE:FF', logInterval: 300 },
    })
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .put(ProgramAction.updateLogIntervalSuccess('1', 300))
      .run();
  });
  it('tryProgramSensor: toggle button when the sensor is not disabled', async () => {
    const toggleButtonMock = jest.fn(() => {});
    const settingManager = { getSetting: () => SETTING.BLUETOOTH.DEFAULT_LOG_INTERVAL };
    const btService = {
      getInfo: () => ({ isDisabled: false }),
      updateLogInterval: () => {},
      toggleButton: toggleButtonMock,
    };

    DependencyLocator.register('settingManager', settingManager);
    DependencyLocator.register('bleService', btService);
    DependencyLocator.register('utilService', new UtilService());

    await expectSaga(ProgramSaga.tryProgramNewSensor, {
      payload: { macAddress: 'AA:BB:CC:DD:EE:FF', logInterval: 300 },
    })
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .run();

    expect(toggleButtonMock).toBeCalledTimes(1);
  });
  it('tryProgramSensor: fail & update log interval', async () => {
    const updateLogIntervalMock = jest.fn(() => {
      throw new Error();
    });
    const settingManager = { getSetting: () => SETTING.BLUETOOTH.DEFAULT_LOG_INTERVAL };
    const btService = {
      getInfo: () => ({}),
      updateLogInterval: updateLogIntervalMock,
      toggleButton: () => {},
    };

    DependencyLocator.register('settingManager', settingManager);
    DependencyLocator.register('bleService', btService);
    DependencyLocator.register('utilService', new UtilService());

    await expectSaga(ProgramSaga.tryProgramNewSensor, {
      payload: { macAddress: 'AA:BB:CC:DD:EE:FF', logInterval: 300 },
    })
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .run();

    expect(updateLogIntervalMock).toBeCalledTimes(10);
  });
  it('tryProgramSensor: fail & retry toggle button', async () => {
    const toggleButtonMock = jest.fn(() => {
      throw new Error();
    });
    const settingManager = { getSetting: () => SETTING.BLUETOOTH.DEFAULT_LOG_INTERVAL };
    const btService = {
      getInfo: () => ({ isDisabled: false }),
      updateLogInterval: () => {},
      toggleButton: toggleButtonMock,
    };

    DependencyLocator.register('settingManager', settingManager);
    DependencyLocator.register('bleService', btService);
    DependencyLocator.register('utilService', new UtilService());

    await expectSaga(ProgramSaga.tryProgramNewSensor, {
      payload: { macAddress: 'AA:BB:CC:DD:EE:FF', logInterval: 300 },
    })
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .run();

    expect(toggleButtonMock).toBeCalledTimes(10);
  });
  it('tryProgramSensor: fail & retry getInfo', async () => {
    const getInfoMock = jest.fn(() => {
      throw new Error();
    });
    const settingManager = { getSetting: () => SETTING.BLUETOOTH.DEFAULT_LOG_INTERVAL };
    const btService = {
      getInfo: getInfoMock,
      updateLogInterval: () => {},
      toggleButton: () => {},
    };

    DependencyLocator.register('settingManager', settingManager);
    DependencyLocator.register('bleService', btService);
    DependencyLocator.register('utilService', new UtilService());

    await expectSaga(ProgramSaga.tryProgramNewSensor, {
      payload: { macAddress: 'AA:BB:CC:DD:EE:FF', logInterval: 300 },
    })
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .run();

    expect(getInfoMock).toBeCalledTimes(10);
  });
  it('tryProgramSensor: fail', () => {
    const getInfoMock = jest.fn(() => {
      throw new Error('Josh');
    });
    const settingManager = { getSetting: () => SETTING.BLUETOOTH.DEFAULT_LOG_INTERVAL };
    const btService = {
      getInfo: getInfoMock,
      updateLogInterval: () => {},
      toggleButton: () => {},
    };

    DependencyLocator.register('settingManager', settingManager);
    DependencyLocator.register('bleService', btService);
    DependencyLocator.register('utilService', new UtilService());

    return expectSaga(ProgramSaga.tryProgramNewSensor, {
      payload: { macAddress: 'AA:BB:CC:DD:EE:FF', logInterval: 300 },
    })
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .put(ProgramAction.programNewSensorFail('AA:BB:CC:DD:EE:FF', 'Error: Josh'))
      .run();
  });
  it('tryProgramSensor: success', () => {
    const settingManager = {
      getSetting: () => 300,
    };
    const btService = {
      getInfo: () => ({ batteryLevel: 90, isDisabled: false }),
      updateLogInterval: () => {},
      toggleButton: () => {},
    };

    DependencyLocator.register('settingManager', settingManager);
    DependencyLocator.register('bleService', btService);
    DependencyLocator.register('utilService', new UtilService());

    return expectSaga(ProgramSaga.tryProgramNewSensor, {
      payload: { macAddress: 'AA:BB:CC:DD:EE:FF', logDelay: 0 },
    })
      .provide([[getContext('dependencyLocator'), DependencyLocator]])
      .put(ProgramAction.programNewSensorSuccess('AA:BB:CC:DD:EE:FF', 300, 0, 90))
      .run();
  });
});
