import { Equal } from 'typeorm/browser';
import { ConsecutiveBreachManager } from '~features/Breach';
import { UtilService } from '~common/services/UtilService';
import { ENTITIES } from '../../../../src/common/constants';

describe('ConsecutiveBreachManager: closeBreach', () => {
  it('Returns a closed breach', () => {
    const breachManager = new ConsecutiveBreachManager();

    const breach = { id: 'a' };
    const closedBreach = breachManager.closeBreach(breach, 0);

    expect(closedBreach).toEqual({ ...breach, endTimestamp: 0 });
  });
});

describe('ConsecutiveBreachManager: createBreach', () => {
  it('Returns a newly created breach', () => {
    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const sensor = { id: 'a' };
    const config = { id: 'a' };
    const startTimestamp = 0;

    const closedBreach = breachManager.createBreach(sensor, config, startTimestamp);
    const closedBreachShouldBe = {
      id: '1',
      sensorId: 'a',
      temperatureBreachConfigurationId: 'a',
      temperatureBreachConfiguration: config,
      startTimestamp: 0,
      acknowledged: false,
    };

    expect(closedBreach).toEqual(closedBreachShouldBe);
  });
});

describe('ConsecutiveBreachManager: willCreateBreach', () => {
  it('Correctly determines when a breach should be created', () => {
    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 10 },
    ];
    const config = { id: 'a', minimumTemperature: 8, duration: 1000, maximumTemperature: 999 };

    const willCreateBreach = breachManager.willCreateBreach(config, logs);

    expect(willCreateBreach).toEqual(true);
  });
  it('Correctly determines when a breach should not be created because of temperature', () => {
    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 7 },
    ];
    const config = { id: 'a', minimumTemperature: 8, duration: 1000, maximumTemperature: 999 };

    const willCreateBreach = breachManager.willCreateBreach(config, logs);

    expect(willCreateBreach).toEqual(false);
  });
  it('Correctly determines when a breach should not be created because of duration', () => {
    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 10 },
    ];
    const config = { id: 'a', minimumTemperature: 8, duration: 5000, maximumTemperature: 999 };

    const willCreateBreach = breachManager.willCreateBreach(config, logs);

    expect(willCreateBreach).toEqual(false);
  });
});

describe('ConsecutiveBreachManager: willCreateBreachFromConfigs', () => {
  it('Correctly returns the config that makes a breach', () => {
    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 10 },
    ];
    const configs = [
      { id: 'a', minimumTemperature: 8, duration: 5000, maximumTemperature: 999 },
      { id: 'b', minimumTemperature: 8, duration: 1000, maximumTemperature: 999 },
    ];

    const willCreateBreach = breachManager.willCreateBreachFromConfigs(configs, logs);

    expect(willCreateBreach).toEqual([
      true,
      { id: 'b', minimumTemperature: 8, duration: 1000, maximumTemperature: 999 },
    ]);
  });
  it('Correctly returns false when none should be made', () => {
    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 10 },
    ];
    const configs = [
      { id: 'a', minimumTemperature: 8, duration: 5000, maximumTemperature: 999 },
      { id: 'b', minimumTemperature: 8, duration: 5000, maximumTemperature: 999 },
    ];

    const willCreateBreach = breachManager.willCreateBreachFromConfigs(configs, logs);

    expect(willCreateBreach[0]).toEqual(false);
  });
});

describe('ConsecutiveBreachManager: addLogToBreach', () => {
  it('Correctly adds a log to a breach', () => {
    const breachManager = new ConsecutiveBreachManager();

    const log = { timestamp: 0, temperature: 10 };
    const breach = { id: 'breach' };

    const resultLog = breachManager.addLogToBreach(breach, log);

    expect(resultLog).toEqual({ timestamp: 0, temperature: 10, temperatureBreachId: 'breach' });
  });
});

describe('ConsecutiveBreachManager: willContinueBreach', () => {
  it('Correctly determines that a breach should be continued by a log', () => {
    const breachManager = new ConsecutiveBreachManager();

    const config = { minimumTemperature: 8, maximumTemperature: 999 };
    const breach = { temperatureBreachConfiguration: config };
    const log = { temperature: 10 };

    expect(breachManager.willContinueBreach(breach, log)).toEqual(true);
  });
  it('Correctly determines that a breach should not be continued by a log', () => {
    const breachManager = new ConsecutiveBreachManager();

    const config = { minimumTemperature: 8, maximumTemperature: 999 };
    const breach = { temperatureBreachConfiguration: config };
    const log = { temperature: 2 };

    expect(breachManager.willContinueBreach(breach, log)).toEqual(false);
  });
});

describe('ConsecutiveBreachManager: willCloseBreach ', () => {
  it('Correctly determines that a log will close off a breach', () => {
    const breachManager = new ConsecutiveBreachManager();

    const config = { minimumTemperature: 8, maximumTemperature: 999 };
    const breach = { temperatureBreachConfiguration: config };
    const log = { temperature: 2 };

    expect(breachManager.willCloseBreach(breach, log)).toEqual(true);
  });
  it('Correctly determines that a breach should be continued by a log', () => {
    const breachManager = new ConsecutiveBreachManager();

    const config = { minimumTemperature: 8, maximumTemperature: 999 };
    const breach = { temperatureBreachConfiguration: config };
    const log = { temperature: 10 };

    expect(breachManager.willCloseBreach(breach, log)).toEqual(false);
  });
});

describe('ConsecutiveBreachManager: couldBeInBreach', () => {
  it('Correctly determines from one config that a log could be in breach', () => {
    const breachManager = new ConsecutiveBreachManager();

    const configs = [{ minimumTemperature: 8, maximumTemperature: 999 }];
    const log = { temperature: 10 };

    expect(breachManager.couldBeInBreach(log, configs)).toEqual(true);
  });
  it('Correctly determines from many configs that a log could be in breach', () => {
    const breachManager = new ConsecutiveBreachManager();

    const configs = [
      { minimumTemperature: 8, maximumTemperature: 999 },
      { minimumTemperature: 6, maximumTemperature: 999 },
    ];
    const log = { temperature: 10 };

    expect(breachManager.couldBeInBreach(log, configs)).toEqual(true);
  });
  it('Correctly determines from many configs that a log should not be in breach', () => {
    const breachManager = new ConsecutiveBreachManager();

    const configs = [
      { minimumTemperature: 8, maximumTemperature: 999 },
      { minimumTemperature: 8, maximumTemperature: 999 },
    ];
    const log = { temperature: 4 };

    expect(breachManager.couldBeInBreach(log, configs)).toEqual(false);
  });
  it('Correctly determines from a config that a log should not be in breach', () => {
    const breachManager = new ConsecutiveBreachManager();

    const configs = [{ minimumTemperature: 8, maximumTemperature: 999 }];
    const log = { temperature: 4 };

    expect(breachManager.couldBeInBreach(log, configs)).toEqual(false);
  });
});

describe('ConsecutiveBreachManager: getBreachConfigs', () => {
  it('returns configs', async () => {
    const configs = [{ id: 'a' }, { id: 'b' }];
    const mockQueryWith = jest.fn(async () => configs);
    const dbService = { queryWith: mockQueryWith };

    const breachManager = new ConsecutiveBreachManager(dbService);

    const result = breachManager.getBreachConfigs();
    await expect(result).resolves.toEqual(configs);
  });
  it('calls queryWith with the right params', async () => {
    const configs = [{ id: 'a' }, { id: 'b' }];
    const mockQueryWith = jest.fn(async () => configs);
    const dbService = { queryWith: mockQueryWith };

    const breachManager = new ConsecutiveBreachManager(dbService);
    await breachManager.getBreachConfigs();

    await expect(mockQueryWith).toBeCalledTimes(1);
    await expect(mockQueryWith).toHaveBeenCalledWith(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION, {
      where: [{ id: Equal('HOT_BREACH') }, { id: Equal('COLD_BREACH') }],
    });
  });
});

describe('ConsecutiveBreachManager: updateBreaches', () => {
  it('returns updated records', async () => {
    const upsertMock = jest.fn((_, entities) => entities);
    const updateManyMock = jest.fn(() => {});
    const mockDbService = { upsert: upsertMock, updateMany: updateManyMock };

    const breachManager = new ConsecutiveBreachManager(mockDbService);

    const breaches = [{ id: 'a' }];
    const logs = [{ id: 'a', timestamp: 0, temperature: 0 }];

    const result = breachManager.updateBreaches(breaches, logs);

    await expect(result).resolves.toEqual([breaches, logs]);
  });
});

describe('ConsecutiveBreachManager: createBreachesFrom', () => {
  it('Returns the correct timestamp when one exists', async () => {
    const mockQueryWith = jest.fn(async () => [{ timestamp: 1 }]);
    const mockDbService = { queryWith: mockQueryWith };

    const breachManager = new ConsecutiveBreachManager(mockDbService);

    await expect(breachManager.createBreachesFrom('a')).resolves.toEqual(1);
  });
  it('Returns the correct timestamp when none exist', async () => {
    const mockQueryWith = jest.fn(async () => []);
    const mockDbService = { queryWith: mockQueryWith };

    const breachManager = new ConsecutiveBreachManager(mockDbService);

    await expect(breachManager.createBreachesFrom('a')).resolves.toEqual(0);
  });
});

describe('ConsecutiveBreachManager: getMostRecentBreachLog', () => {
  it('Returns the a breach log', async () => {
    const mockQueryWith = jest.fn(async () => [{ id: 'a' }]);
    const mockDbService = { queryWith: mockQueryWith };

    const breachManager = new ConsecutiveBreachManager(mockDbService);

    await expect(breachManager.getMostRecentBreachLog('a')).resolves.toEqual({ id: 'a' });
  });
  it('Returns undefined when none exist', async () => {
    const mockQueryWith = jest.fn(async () => []);
    const mockDbService = { queryWith: mockQueryWith };

    const breachManager = new ConsecutiveBreachManager(mockDbService);

    await expect(breachManager.getMostRecentBreachLog('a')).resolves.toBeUndefined();
  });
});

describe('ConsecutiveBreachManager: getMostRecentBreach', () => {
  it('It returns a breach', async () => {
    const mockQueryWith = jest.fn(async () => [{ id: 'a' }]);
    const mockDbService = { queryWith: mockQueryWith };

    const breachManager = new ConsecutiveBreachManager(mockDbService);

    await expect(breachManager.getMostRecentBreachLog('a')).resolves.toEqual({ id: 'a' });
  });
  it('It returns a undefined when there are no breaches', async () => {
    const mockQueryWith = jest.fn(async () => []);
    const mockDbService = { queryWith: mockQueryWith };

    const breachManager = new ConsecutiveBreachManager(mockDbService);

    await expect(breachManager.getMostRecentBreachLog('a')).resolves.toBeUndefined();
  });
});

describe('ConsecutiveBreachManager: createBreaches', () => {
  it('Creates a simple single breach', async () => {
    const sensor = { id: 'a' };
    const logs = [
      { temperature: 10, timestamp: 0 },
      { temperature: 10, timestamp: 1 },
    ];
    const configs = [{ id: 'a', duration: 1000, minimumTemperature: 8, maximumTemperature: 999 }];

    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const breachesShouldBe = [
      {
        id: '1',
        sensorId: 'a',
        startTimestamp: 0,
        temperatureBreachConfigurationId: 'a',
        endTimestamp: undefined,
      },
    ];

    const logsShouldBe = [
      { temperature: 10, timestamp: 0, temperatureBreachId: '1' },
      { temperature: 10, timestamp: 1, temperatureBreachId: '1' },
    ];

    await expect(breachManager.createBreaches(sensor, logs, configs)).toEqual([
      breachesShouldBe,
      logsShouldBe,
    ]);
  });
  it('Creates a simple single breach that is closed', async () => {
    const sensor = { id: 'a' };
    const logs = [
      { temperature: 10, timestamp: 0 },
      { temperature: 10, timestamp: 1 },
      { temperature: 1, timestamp: 2 },
    ];
    const configs = [{ id: 'a', duration: 1000, minimumTemperature: 8, maximumTemperature: 999 }];

    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const breachesShouldBe = [
      {
        id: '1',
        sensorId: 'a',
        startTimestamp: 0,
        temperatureBreachConfigurationId: 'a',
        endTimestamp: 2,
      },
    ];

    const logsShouldBe = [
      { temperature: 10, timestamp: 0, temperatureBreachId: '1' },
      { temperature: 10, timestamp: 1, temperatureBreachId: '1' },
    ];

    await expect(breachManager.createBreaches(sensor, logs, configs)).toEqual([
      breachesShouldBe,
      logsShouldBe,
    ]);
  });
  it('Creates a multiple breaches', async () => {
    const sensor = { id: 'a' };
    const logs = [
      { temperature: 10, timestamp: 0 },
      { temperature: 10, timestamp: 1 },
      { temperature: 1, timestamp: 2 },
      { temperature: 10, timestamp: 3 },
      { temperature: 10, timestamp: 4 },
    ];
    const configs = [{ id: 'a', duration: 1000, minimumTemperature: 8, maximumTemperature: 999 }];

    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const breachesShouldBe = [
      {
        id: '1',
        sensorId: 'a',
        startTimestamp: 0,
        temperatureBreachConfigurationId: 'a',
        endTimestamp: 2,
      },
      {
        id: '1',
        sensorId: 'a',
        startTimestamp: 3,
        temperatureBreachConfigurationId: 'a',
        endTimestamp: undefined,
      },
    ];

    const logsShouldBe = [
      { temperature: 10, timestamp: 0, temperatureBreachId: '1' },
      { temperature: 10, timestamp: 1, temperatureBreachId: '1' },
      { temperature: 10, timestamp: 3, temperatureBreachId: '1' },
      { temperature: 10, timestamp: 4, temperatureBreachId: '1' },
    ];

    await expect(breachManager.createBreaches(sensor, logs, configs)).toEqual([
      breachesShouldBe,
      logsShouldBe,
    ]);
  });
  it('Creates respects duration when creating breaches', async () => {
    const sensor = { id: 'a' };
    const logs = [
      { temperature: 10, timestamp: 0 },
      { temperature: 1, timestamp: 2 },
      { temperature: 10, timestamp: 4 },
    ];
    const configs = [{ id: 'a', duration: 1000, minimumTemperature: 8, maximumTemperature: 999 }];

    const utils = new UtilService();
    const breachManager = new ConsecutiveBreachManager({}, utils);

    const breachesShouldBe = [];
    const logsShouldBe = [];

    await expect(breachManager.createBreaches(sensor, logs, configs)).toEqual([
      breachesShouldBe,
      logsShouldBe,
    ]);
  });
});
