import {
  BatteryObserverInitialState,
  BatteryObserverReducer,
  BatteryObserverAction,
  // BatteryObserverSaga,
} from '~features/Bluetooth';

// TODO: Saga tests

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
