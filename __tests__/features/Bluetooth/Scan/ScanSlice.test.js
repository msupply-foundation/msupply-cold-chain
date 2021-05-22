import { expectSaga } from 'redux-saga-test-plan';

import { ScanReducer, ScanInitialState, ScanAction, ScanSaga } from '~features/Bluetooth';

import { SensorAction, SensorInitialState } from '../../../../src/features/Entities/Sensor';

describe('ScanAction', () => {
  it('has matching snapshots', () => {
    const actions = Object.values(ScanAction).map(action => action());
    expect(actions).toMatchSnapshot();
  });
});

describe('ScanReducer', () => {
  it('Correct state after dispatching a success', () => {
    const newState = ScanReducer(
      { ...ScanInitialState, foundSensors: ['A'] },
      SensorAction.createSuccess('id', { macAddress: 'A' })
    );
    expect(newState).toEqual({ foundSensors: [], isScanning: false });
  });
  it('start failure sets state correctly', () => {
    const newState = ScanReducer(ScanInitialState, ScanAction.stopFail());
    expect(newState).toEqual({ foundSensors: [], isScanning: false });
  });
  it('stopSuccess', () => {
    const newState = ScanReducer(ScanInitialState, ScanAction.stopSuccess());
    expect(newState).toEqual({ foundSensors: [], isScanning: false });
  });
  it('startFail', () => {
    const newState = ScanReducer(ScanInitialState, ScanAction.startFail());
    expect(newState).toEqual({ foundSensors: [], isScanning: false });
  });
  it('startSuccess', () => {
    const newState = ScanReducer(ScanInitialState, ScanAction.startSuccess());
    expect(newState).toEqual({ foundSensors: [], isScanning: true });
  });
});

describe('ScanSaga', () => {
  it('Starting a scan, scans for sensors and dispatches a foundSensor action for a device returned from the channel.', () => {
    const btService = {
      scanForSensors: () => {},
      stopScan: () => {},
    };

    let count = 0;

    const depsLocator = { get: () => btService };
    return expectSaga(ScanSaga.root)
      .withState({
        bluetooth: { scan: ScanInitialState },
        entities: { sensor: SensorInitialState },
      })

      .provide({
        getContext: () => depsLocator,
        take: (params, next) => {
          // On the first call of Take, for the channel,
          // Return a device.
          if (count <= 1 && params.channel) {
            count += 1;
            return { id: 'A' };
          }
          return next();
        },
      })
      .dispatch(ScanAction.tryStart())
      .put(ScanAction.startSuccess())
      .put(ScanAction.foundSensor('A'))
      .silentRun(20);
  });
  it('ScanSaga: Successfully starts and stops the bluetooth scanner', () => {
    const btService = {
      scanForSensors: () => {},
      stopScan: () => {},
    };
    const depsLocator = { get: () => btService };
    return expectSaga(ScanSaga.root)
      .provide({
        getContext: () => depsLocator,
      })
      .put(ScanAction.startSuccess())
      .put(ScanAction.stopSuccess())
      .call(btService.stopScan)
      .dispatch(ScanAction.tryStart())
      .dispatch(ScanAction.tryStop())
      .silentRun(20);
  });

  it('ScanSaga: Does nothing when calling stop when nothing has started.', () => {
    const btService = {
      scanForSensors: () => {},
      stopScan: () => {},
    };
    const depsLocator = { get: () => btService };

    return expectSaga(ScanSaga.root)
      .provide({ getContext: () => depsLocator })
      .dispatch(ScanAction.tryStop())
      .not.call(btService.stopScan)
      .not.call(ScanSaga.stop)
      .not.call(ScanSaga.start)
      .not.call(ScanSaga.stopOrStart)
      .silentRun(20);
  });
});
