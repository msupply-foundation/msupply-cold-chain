import { expectSaga } from 'redux-saga-test-plan';
import * as DatabaseSagas from '~database/DatabaseSagas';
import { DatabaseReducer } from './DatabaseSlice';

const macAddress = 'DB:56:07:61:C7:13';

describe('Database Sagas: createBreaches', () => {
  it('correctly manipulates the store', () => {
    const action = { payload: { macAddress } };

    const createBreaches = jest.fn(async () => ({ createdBreaches: [1], endedBreaches: [1] }));
    const dbServiceMock = jest.fn(() => ({ createBreaches }));

    const pretendFinalState = {
      sensors: { sensorIds: [], byId: {} },
      temperatureLogs: { bySensorId: {}, fromDate: null, toDate: null },
    };

    return expectSaga(DatabaseSagas.createBreaches, action)
      .provide({ getContext: () => dbServiceMock })
      .withReducer(DatabaseReducer)
      .hasFinalState(pretendFinalState)
      .silentRun();
  });
});

describe('Database Sagas: createTemperatureLogs', () => {
  it('manipulates the store correctly', () => {
    const pretendFinalState = {
      sensors: { sensorIds: [], byId: {} },
      temperatureLogs: { bySensorId: {}, fromDate: null, toDate: null },
    };

    const action = { payload: { macAddress } };

    const createTemperatureLogs = jest.fn(async () => [1]);
    const dbServiceMock = jest.fn(() => ({ createTemperatureLogs }));

    return expectSaga(DatabaseSagas.createTemperatureLogs, action)
      .provide({ getContext: () => dbServiceMock })
      .withReducer(DatabaseReducer)
      .hasFinalState(pretendFinalState)
      .run();
  });
});

describe('Database Sagas: saveSensors', () => {
  it('manipulates the store correctly', () => {
    const pretendFinalState = {
      sensors: { sensorIds: [1], byId: { 1: { id: 1 } } },
      temperatureLogs: { bySensorId: {}, fromDate: null, toDate: null },
    };

    const action = { payload: { macAddress } };

    const saveSensors = jest.fn(async () => [{ id: 1 }]);
    const dbServiceMock = jest.fn(() => ({ saveSensors }));

    return expectSaga(DatabaseSagas.saveSensors, action)
      .provide({ getContext: () => dbServiceMock })
      .withReducer(DatabaseReducer)
      .hasFinalState(pretendFinalState)
      .run();
  });
});

describe('Database Sagas: saveSensorLogs', () => {
  it('manipulates the store correctly', () => {
    const pretendFinalState = {
      sensors: { sensorIds: [], byId: {} },
      temperatureLogs: { bySensorId: {}, fromDate: null, toDate: null },
    };

    const action = { payload: { macAddress } };

    const saveSensorLogs = jest.fn(async () => [1]);
    const dbServiceMock = jest.fn(() => ({ saveSensorLogs }));

    return expectSaga(DatabaseSagas.saveSensorLogs, action)
      .provide({ getContext: () => dbServiceMock })
      .withReducer(DatabaseReducer)
      .hasFinalState(pretendFinalState)
      .run();
  });
});
