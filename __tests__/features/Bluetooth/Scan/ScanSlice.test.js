import { expectSaga } from 'redux-saga-test-plan';
import { getContext } from 'redux-saga/effects';
import { ScanReducer, ScanInitialState, ScanAction, ScanSaga } from '~features/Bluetooth';
import { DEPENDENCY } from '../../../../src/common/constants';
import { SensorAction } from '../../../../src/features/Entities';

describe('ScanAction', () => {
  it('has matching snapshots', () => {
    const actions = Object.values(ScanAction).map(action => action());
    expect(actions).toMatchSnapshot();
  });
});

describe('ScanReducer', () => {
  it('stopFail', () => {
    const newState = ScanReducer(
      { ...ScanInitialState, foundSensors: ['A'] },
      SensorAction.createSuccess('id', { macAddress: 'A' })
    );
    expect(newState).toEqual({ foundSensors: [], isScanning: false });
  });
  it('stopFail', () => {
    const newState = ScanReducer(ScanInitialState, ScanAction.startFail());
    expect(newState).toEqual({ foundSensors: [], isScanning: false });
  });
  it('stopSuccess', () => {
    const newState = ScanReducer(ScanInitialState, ScanAction.startFail());
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
  it('', () => {
    const btService = { scanForSensors: callback => callback({ id: 'A' }), stopScan: () => {} };
    const depsLocator = { get: () => btService };
    return expectSaga(ScanSaga.root)
      .provide([[getContext(DEPENDENCY.LOCATOR), depsLocator]])
      .dispatch(ScanAction.tryStart())
      .put(ScanAction.foundSensor('A'))
      .run();
  });
});
