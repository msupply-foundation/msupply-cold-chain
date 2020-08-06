import {
  BluetoothStateReducer,
  BluetoothStateActions,
  PassiveBluetoothReducer,
  PassiveBluetoothActions,
} from './bluetoothSlice';
import { TEMPERATURE_SYNC_STATE , BLUETOOTH_SERVICE, PASSIVE_TEMPERATURE_SYNC_STATE } from '~constants';


describe('BluetoothStateActions', () => {
  it('downloadTemperatures', () => {
    expect(BluetoothStateActions.downloadTemperatures()).toMatchSnapshot();
  });
  it('startTemperatureSync', () => {
    expect(BluetoothStateActions.startTemperatureSync()).toMatchSnapshot();
  });
  it('scanForSensors', () => {
    expect(BluetoothStateActions.scanForSensors()).toMatchSnapshot();
  });
  it('complete', () => {
    expect(BluetoothStateActions.complete()).toMatchSnapshot();
  });
  it('start', () => {
    expect(BluetoothStateActions.start()).toMatchSnapshot();
  });
  it('disable', () => {
    expect(BluetoothStateActions.disable()).toMatchSnapshot();
  });
  it('error', () => {
    expect(BluetoothStateActions.error()).toMatchSnapshot();
  });
});

describe('PassiveBluetoothActions', () => {
  it('startTimer', () => {
    expect(PassiveBluetoothActions.startTimer()).toMatchSnapshot();
  });
  it('decrementTimer', () => {
    expect(PassiveBluetoothActions.decrementTimer()).toMatchSnapshot();
  });
  it('completeTimer', () => {
    expect(PassiveBluetoothActions.completeTimer()).toMatchSnapshot();
  });
  it('start', () => {
    expect(PassiveBluetoothActions.start()).toMatchSnapshot();
  });
  it('stop', () => {
    expect(PassiveBluetoothActions.stop()).toMatchSnapshot();
  });
  it('stopped', () => {
    expect(PassiveBluetoothActions.stopped()).toMatchSnapshot();
  });
  it('complete', () => {
    expect(PassiveBluetoothActions.complete()).toMatchSnapshot();
  });
});

describe('BluetoothStateReducer', () => {
  it('downloadTemperatures', () => {
    const initialState = { state: TEMPERATURE_SYNC_STATE.ENABLED };
    expect(
      BluetoothStateReducer(initialState, BluetoothStateActions.downloadTemperatures())
    ).toEqual(initialState);
  });
  it('startTemperatureSync', () => {
    const initialState = { state: TEMPERATURE_SYNC_STATE.ENABLED };
    expect(
      BluetoothStateReducer(initialState, BluetoothStateActions.startTemperatureSync())
    ).toEqual(initialState);
  });
  it('complete', () => {
    const initialState = { state: TEMPERATURE_SYNC_STATE.IN_PROGRESS };
    expect(BluetoothStateReducer(initialState, BluetoothStateActions.complete())).toEqual({
      state: TEMPERATURE_SYNC_STATE.ENABLED,
    });
  });
  it('start', () => {
    const initialState = { state: TEMPERATURE_SYNC_STATE.ENABLED };
    expect(BluetoothStateReducer(initialState, BluetoothStateActions.start())).toEqual({
      state: TEMPERATURE_SYNC_STATE.IN_PROGRESS,
    });
  });
  it('disable', () => {
    const initialState = { state: TEMPERATURE_SYNC_STATE.ENABLED };
    expect(BluetoothStateReducer(initialState, BluetoothStateActions.disable())).toEqual({
      state: TEMPERATURE_SYNC_STATE.DISABLED,
    });
  });
  it('error', () => {
    const initialState = { state: TEMPERATURE_SYNC_STATE.ENABLED };
    expect(BluetoothStateReducer(initialState, BluetoothStateActions.error())).toEqual({
      state: TEMPERATURE_SYNC_STATE.ERROR,
    });
  });
});

describe('PassiveBluetoothReducer', () => {
  it('startTimer', () => {
    const initialState = { timer: null, state: null };
    expect(PassiveBluetoothReducer(initialState, PassiveBluetoothActions.startTimer())).toEqual({
      timer: BLUETOOTH_SERVICE.DEFAULT_PASSIVE_DOWNLOAD_DELAY,
      state: null,
    });
  });
  it('decrementTimer', () => {
    const initialState = { timer: BLUETOOTH_SERVICE.DEFAULT_PASSIVE_DOWNLOAD_DELAY, state: null };
    expect(PassiveBluetoothReducer(initialState, PassiveBluetoothActions.decrementTimer())).toEqual(
      {
        timer:
          BLUETOOTH_SERVICE.DEFAULT_PASSIVE_DOWNLOAD_DELAY - BLUETOOTH_SERVICE.DEFAULT_TIMER_DELAY,
        state: null,
      }
    );
  });
  it('completeTimer', () => {
    const initialState = { timer: BLUETOOTH_SERVICE.DEFAULT_PASSIVE_DOWNLOAD_DELAY, state: null };
    expect(PassiveBluetoothReducer(initialState, PassiveBluetoothActions.completeTimer())).toEqual({
      timer: null,
      state: null,
    });
  });
  it('start', () => {
    const initialState = { timer: null, state: null };
    expect(PassiveBluetoothReducer(initialState, PassiveBluetoothActions.start())).toEqual({
      timer: null,
      state: PASSIVE_TEMPERATURE_SYNC_STATE.IN_PROGRESS,
    });
  });
  it('stop', () => {
    const initialState = { timer: null, state: null };
    expect(PassiveBluetoothReducer(initialState, PassiveBluetoothActions.stop())).toEqual({
      timer: null,
      state: null,
    });
  });
  it('stopped', () => {
    const initialState = { timer: null, state: null };
    expect(PassiveBluetoothReducer(initialState, PassiveBluetoothActions.stopped())).toEqual({
      timer: null,
      state: PASSIVE_TEMPERATURE_SYNC_STATE.STOPPED,
    });
  });
  it('complete', () => {
    const initialState = { timer: null, state: null };
    expect(PassiveBluetoothReducer(initialState, PassiveBluetoothActions.complete())).toEqual({
      timer: null,
      state: PASSIVE_TEMPERATURE_SYNC_STATE.WAITING,
    });
  });
});
