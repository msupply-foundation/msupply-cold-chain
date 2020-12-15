import { expectSaga } from 'redux-saga-test-plan';
import { put, getContext } from 'redux-saga/effects';
import {
  BatteryObserverInitialState,
  BatteryObserverReducer,
  BatteryObserverAction,
  BatteryObserverSaga,
} from '~features/Bluetooth';

import { DEPENDENCY } from '~constants';
import { SensorAction } from '../../../../src/features/Entities';

describe('BatteryObserverSlice: BatteryObserverSaga', () => {
  it('Does not manipulate state', () => {
    const mockSensors = [{ id: '1', macAddress: 'AA:BB:CC:DD:EE:FF', batteryLevel: 90 }];
    const sensorManager = { getAll: () => mockSensors };
    const getSensorManager = () => sensorManager;
    const depsLocator = { get: getSensorManager };

    return expectSaga(BatteryObserverSaga.updateBatteryLevels)
      .provide([[getContext(DEPENDENCY.LOCATOR), depsLocator]])
      .run()
      .then(result => {
        const { effects } = result;

        expect(effects.put[0]).toEqual(put(SensorAction.update('1', 'batteryLevel', 90)));
        expect(effects.put[1]).toEqual(put(BatteryObserverAction.updateSuccess()));
        expect(effects.put.length).toEqual(2);
      });
  });
});

describe('BatteryObserverSlice: BatteryObserverReducer', () => {
  it('Case: start', () => {
    const state = BatteryObserverReducer(BatteryObserverInitialState, BatteryObserverAction.start);
    expect(state).toEqual({ isWatching: true });
  });
  it('Case: stop', () => {
    const state = BatteryObserverReducer(BatteryObserverInitialState, BatteryObserverAction.stop);
    expect(state).toEqual({ isWatching: false });
  });
});

describe('BatteryObserverSlice: BatteryObserverAction', () => {
  it('Match Snapshots', () => {
    const actionCreators = Object.values(BatteryObserverAction);

    const actions = actionCreators.map(actionCreator => actionCreator());
    expect(actions).toMatchSnapshot();
  });
});
