import * as SyncSlice from '~features/Sync/SyncSlice';

const getInitialState = () => SyncSlice.initialState;

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
    const rootState = { sync: getInitialState() };

    expect(SyncSlice.SyncSelector.getSliceState(rootState)).toEqual(rootState);
  });
});
