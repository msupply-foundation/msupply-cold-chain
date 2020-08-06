import { SensorsActions, SensorsReducer, TemperatureLogActions } from './DatabaseSlice';

describe('SensorsActions', () => {
  it('setSensors', () => {
    const sensors = [{ id: 1 }];
    expect(SensorsActions.setSensors(sensors)).toMatchSnapshot();
  });
  it('saveSensors', () => {
    const sensors = [{ id: 1 }];
    expect(SensorsActions.saveSensors(sensors)).toMatchSnapshot();
  });
});

describe('TemperatureLogActions', () => {
  it('saveTemperatureLogs', () => {
    const logs = [{ id: 1 }];
    expect(TemperatureLogActions.saveTemperatureLogs(logs)).toMatchSnapshot();
  });
  it('saveSensorLogs', () => {
    const sensorLogs = [{ id: 1 }];
    const mac = 'a';
    expect(TemperatureLogActions.saveSensorLogs(sensorLogs, mac)).toMatchSnapshot();
  });
  it('setTemperatureLogs', () => {
    const logs = [{ id: 1 }];
    expect(TemperatureLogActions.setTemperatureLogs(logs)).toMatchSnapshot();
  });
  it('createTemperatureLogs', () => {
    const mac = 'a';
    expect(TemperatureLogActions.createTemperatureLogs(mac)).toMatchSnapshot();
  });
  it('savedTemperatureLogs', () => {
    const mac = 'a';
    const logs = [{ id: 1 }];
    expect(TemperatureLogActions.savedTemperatureLogs(mac, logs)).toMatchSnapshot();
  });
  it('createBreaches', () => {
    const mac = 'a';
    expect(TemperatureLogActions.createBreaches(mac)).toMatchSnapshot();
  });
  it('savedBreaches', () => {
    const created = [];
    const ended = [];
    expect(TemperatureLogActions.savedBreaches(created, ended)).toMatchSnapshot();
  });
});

describe('SensorsReducer', () => {
  it('setSensors', () => {
    const sensors = [{ id: 1 }];
    const initialState = { sensorIds: [], byId: {} };
    expect(SensorsReducer(initialState, SensorsActions.setSensors(sensors))).toEqual({
      sensorIds: [1],
      byId: { 1: { id: 1 } },
    });
  });
  it('saveSensors', () => {
    const sensors = [{ id: 1 }];
    const initialState = { sensorIds: [], byId: {} };
    expect(SensorsReducer(initialState, SensorsActions.saveSensors(sensors))).toEqual(initialState);
  });
});

describe('TemperatureLogReducer', () => {
  it('saveTemperatureLogs', () => {
    const initialState = { bySensorId: {}, fromDate: null, toDate: null };
    expect(SensorsReducer(initialState, TemperatureLogActions.saveTemperatureLogs())).toEqual(
      initialState
    );
  });
  it('saveSensorLogs', () => {
    const initialState = { bySensorId: {}, fromDate: null, toDate: null };
    expect(SensorsReducer(initialState, TemperatureLogActions.saveSensorLogs())).toEqual(
      initialState
    );
  });
  it('setTemperatureLogs', () => {
    const initialState = { bySensorId: {}, fromDate: null, toDate: null };
    expect(SensorsReducer(initialState, TemperatureLogActions.setTemperatureLogs())).toEqual(
      initialState
    );
  });
  it('createTemperatureLogs', () => {
    const initialState = { bySensorId: {}, fromDate: null, toDate: null };
    const mac = 'a';
    expect(SensorsReducer(initialState, TemperatureLogActions.setTemperatureLogs(mac))).toEqual(
      initialState
    );
  });
  it('savedTemperatureLogs', () => {
    const initialState = { bySensorId: {}, fromDate: null, toDate: null };
    expect(SensorsReducer(initialState, TemperatureLogActions.savedTemperatureLogs())).toEqual(
      initialState
    );
  });
  it('createBreaches', () => {
    const initialState = { bySensorId: {}, fromDate: null, toDate: null };
    expect(SensorsReducer(initialState, TemperatureLogActions.createBreaches())).toEqual(
      initialState
    );
  });
  it('savedBreaches', () => {
    const initialState = { bySensorId: {}, fromDate: null, toDate: null };
    expect(SensorsReducer(initialState, TemperatureLogActions.savedBreaches())).toEqual(
      initialState
    );
  });
});
