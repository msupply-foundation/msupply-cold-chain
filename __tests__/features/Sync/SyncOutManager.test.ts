import {
  Sensor,
  TemperatureBreach,
  TemperatureBreachConfiguration,
  TemperatureLog,
} from '~common/services/Database/entities';
import {
  TemperatureBreachSyncOut,
  SensorSyncOut,
  TemperatureLogSyncOut,
} from '~features/Sync/types';
import { SyncOutManager } from '~features/Sync/SyncOutManager';
import Axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(Axios);

const username = 'josh';
const password = 'josh';
const loginUrl = 'loginUrl';
const temperatureBreachUrl = 'temperatureBreachUrl';
const temperatureLogUrl = 'temperatureLogUrl';
const sensorUrl = 'sensorUrl';

const getRandomString = () => {
  return String(Math.random() * 10000);
};

const getSensor = (): Sensor => {
  return { ...getSensorSyncOut(), temperatureLogs: [], temperatureBreaches: [] };
};

const getTemperatureBreachConfig = (): TemperatureBreachConfiguration => {
  return {
    id: 'HOT_CONSECUTIVE',
    minimumTemperature: 99,
    maximumTemperature: 99,
    duration: 99,
    colour: 'colour',
    description: 'desc',
    temperatureBreaches: [],
  };
};

const getTemperatureLogSyncOut = (): TemperatureLogSyncOut => {
  return {
    id: 'id' + getRandomString(),
    temperature: 99,
    timestamp: 99,
    sensorId: 'sensorId',
    temperatureBreachId: 'temperatureBreachId',
    logInterval: 300,
  };
};

const getTemperatureBreachSyncOut = (): TemperatureBreachSyncOut => {
  return {
    id: 'id' + getRandomString(),
    startTimestamp: 99,
    endTimestamp: 99,
    sensorId: 'sensorId',
    thresholdDuration: 99,
    thresholdMaximumTemperature: 99,
    thresholdMinimumTemperature: 99,
    acknowledged: false,
    type: 'HOT_CONSECUTIVE',
  };
};

const getSensorSyncOut = (): SensorSyncOut => {
  return {
    id: 'id' + getRandomString(),
    name: 'name' + getRandomString(),
    logInterval: 300,
    macAddress: 'macAddress' + getRandomString(),
    batteryLevel: 99,
    logDelay: 0,
    programmedDate: 0,
    isActive: false,
  };
};

const getSyncOutManager = (): SyncOutManager => {
  return new SyncOutManager();
};

describe('SyncOutManager: getAuthenticationBody', () => {
  it('returns a valid authentication body', () => {
    const som = getSyncOutManager();
    const result = som.getAuthenticationBody(username, password);
    expect(result).toEqual(JSON.stringify({ username, password }));
  });
});

describe('SyncOutManager: getSyncBody', () => {
  it('returns a correctly stringified body', () => {
    const som = getSyncOutManager();
    const sensor = getSensorSyncOut();
    const result = som.getSyncBody([sensor]);
    expect(result).toEqual(JSON.stringify([sensor]));
  });
});

describe('SyncOutManager: mapSensors', () => {
  it('Returns a correct mapping from Sensor to SensorSyncOut', () => {
    const sensorSyncOut: SensorSyncOut = getSensorSyncOut();
    const sensor: Sensor = { ...sensorSyncOut, temperatureLogs: [], temperatureBreaches: [] };

    const som = getSyncOutManager();

    expect(som.mapSensors([sensor])).toEqual([sensorSyncOut]);
  });
});

describe('SyncOutManager: mapBreaches', () => {
  it('Returns a correct mapping from TemperatureBreach to TemperatureBreachSyncOut', () => {
    const breachSyncOut: TemperatureBreachSyncOut = getTemperatureBreachSyncOut();
    const breach: TemperatureBreach = {
      ...breachSyncOut,
      temperatureLogs: [],
      sensor: getSensor(),
      temperatureBreachConfiguration: getTemperatureBreachConfig(),
      temperatureBreachConfigurationId: 'temperatureBreachConfigurationId',
    };

    const som = getSyncOutManager();

    expect(som.mapBreaches([breach])).toEqual([breachSyncOut]);
  });
});

describe('SyncOutManager: mapTemperatureLogs', () => {
  it('Returns a correct mapping from TemperatureLog to TemperatureLogSyncOut', () => {
    const logSyncOut = getTemperatureLogSyncOut();
    const log: TemperatureLog = { ...logSyncOut, sensor: getSensor() };

    const som = getSyncOutManager();

    expect(som.mapTemperatureLogs([log])).toEqual([logSyncOut]);
  });
});

describe('SyncOutManager: login', () => {
  it('Calls post with the correct parameters', async () => {
    const som = getSyncOutManager();
    mockAxios.onPost(loginUrl).reply(config => {
      return [200, config.data];
    });

    // NOTE: The typings here aren't quite right. The login method does return a promise
    // which resolves to an empty string, however we are mocking a response being the
    // request body so we can check what was passed in and used as the body.
    const result = await som.login(loginUrl, username, password);
    const { data } = result;

    return expect(data).toEqual({ username, password });
  });
});

describe('SyncOutManager: syncSensors', () => {
  it('Calls post with the correct parameters', async () => {
    const som = getSyncOutManager();
    mockAxios.onPut(sensorUrl).reply(config => {
      const { data } = config;
      const parsed = JSON.parse(data);
      return [200, { valid: [parsed[0].id] }];
    });

    const sensorSyncOut = getSensorSyncOut();
    const sensor: Sensor = { ...sensorSyncOut, temperatureLogs: [], temperatureBreaches: [] };
    const result = await som.syncSensors(sensorUrl, [sensor]);
    const { data } = result;

    return expect(data).toEqual({ valid: [sensor.id] });
  });
});

describe('SyncOutManager: syncTemperatureLogs', () => {
  it('Calls post with the correct parameters', async () => {
    const som = getSyncOutManager();
    mockAxios.onPut(temperatureLogUrl).reply(config => {
      const { data } = config;
      const parsed = JSON.parse(data);
      return [200, { valid: [parsed[0].id] }];
    });

    const logSyncOut = getTemperatureLogSyncOut();
    const log: TemperatureLog = { ...logSyncOut, sensor: getSensor() };
    const result = await som.syncTemperatureLogs(temperatureLogUrl, [log]);
    const { data } = result;

    return expect(data).toEqual({ valid: [log.id] });
  });
});

describe('SyncOutManager: syncTemperatureBreaches', () => {
  it('Calls post with the correct parameters', async () => {
    const som = getSyncOutManager();
    mockAxios.onPut(temperatureBreachUrl).reply(config => {
      const { data } = config;
      const parsed = JSON.parse(data);
      return [200, { valid: [parsed[0].id] }];
    });

    const breachSyncOut = getTemperatureBreachSyncOut();
    const breach: TemperatureBreach = {
      ...breachSyncOut,
      sensor: getSensor(),
      temperatureBreachConfigurationId: 'temperatureBreachConfigurationId',
      temperatureBreachConfiguration: getTemperatureBreachConfig(),
      temperatureLogs: [],
    };
    const result = await som.syncTemperatureBreaches(temperatureBreachUrl, [breach]);
    const { data } = result;

    return expect(data).toEqual({ valid: [breach.id] });
  });
});
