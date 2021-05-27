import { DatabaseService } from '~common/services';

const createMockDB = ({ findReturn = [] } = {}) => {
  const mockSave = jest.fn(async object => object);
  const mockFind = jest.fn(async () => findReturn);
  const mockRemove = jest.fn(async entities => entities);
  const mockFindOne = jest.fn(async () => ({}));
  const mockQuery = jest.fn(async () => ({}));
  const mockGetRepository = jest.fn(async () => ({
    save: mockSave,
    find: mockFind,
    remove: mockRemove,
    findOne: mockFindOne,
  }));
  const mockGetConnection = jest.fn(async () => ({ manager: { query: mockQuery } }));

  return {
    database: { getRepository: mockGetRepository, getConnection: mockGetConnection },
    mockQuery,
    mockGetRepository,
    mockSave,
    mockFind,
    mockRemove,
    mockFindOne,
  };
};

describe('DatabaseService: init', () => {
  it('Calls install on each trigger passed in the database configuration when constructed.', async () => {
    const db = createMockDB();
    const mockInstall = jest.fn();
    const mockInstall2 = jest.fn();
    const config = {
      triggers: [{ install: mockInstall }, { install: mockInstall2 }],
    };

    const dbService = new DatabaseService(db, config);
    dbService.init();

    await expect(mockInstall).toBeCalledTimes(1);
    await expect(mockInstall).toBeCalledTimes(1);
  });

  // it('returns the records inserted', async () => {
  //   const { database } = createMockDB();
  //   const dbService = new DatabaseService(database);

  //   const configs = [
  //     {
  //       id: 'HOT_BREACH',
  //       minimumTemperature: 8,
  //       maximumTemperature: 999,
  //       duration: MILLISECONDS.ONE_MINUTE * 30,
  //       description: 'Hot breach',
  //     },

  //     {
  //       id: 'HOT_CUMULATIVE',
  //       minimumTemperature: 8,
  //       maximumTemperature: 999,
  //       duration: MILLISECONDS.ONE_MINUTE * 60,
  //       description: 'Hot cumulative',
  //     },
  //     {
  //       id: 'COLD_BREACH',
  //       minimumTemperature: -999,
  //       maximumTemperature: 2,
  //       duration: MILLISECONDS.ONE_MINUTE * 20,
  //       description: 'Cold breach',
  //     },
  //     {
  //       id: 'COLD_CUMULATIVE',
  //       minimumTemperature: -999,
  //       maximumTemperature: 2,
  //       duration: MILLISECONDS.ONE_MINUTE * 40,
  //       description: 'Cold cumulative',
  //     },
  //   ];

  //   await expect(dbService.init()).resolves.toEqual(configs);
  // });
  // it('Calls upsert with the correct params', async () => {
  //   const { mockSave, database, mockGetRepository } = createMockDB();
  //   const dbService = new DatabaseService(database);

  //   const configs = [
  //     {
  //       id: 'HOT_BREACH',
  //       minimumTemperature: 8,
  //       maximumTemperature: 999,
  //       duration: MILLISECONDS.ONE_MINUTE * 30,
  //       description: 'Hot breach',
  //     },

  //     {
  //       id: 'HOT_CUMULATIVE',
  //       minimumTemperature: 8,
  //       maximumTemperature: 999,
  //       duration: MILLISECONDS.ONE_MINUTE * 60,
  //       description: 'Hot cumulative',
  //     },
  //     {
  //       id: 'COLD_BREACH',
  //       minimumTemperature: -999,
  //       maximumTemperature: 2,
  //       duration: MILLISECONDS.ONE_MINUTE * 20,
  //       description: 'Cold breach',
  //     },
  //     {
  //       id: 'COLD_CUMULATIVE',
  //       minimumTemperature: -999,
  //       maximumTemperature: 2,
  //       duration: MILLISECONDS.ONE_MINUTE * 40,
  //       description: 'Cold cumulative',
  //     },
  //   ];

  //   await dbService.init();
  //   expect(mockSave).toBeCalledTimes(1);
  //   expect(mockSave).toBeCalledWith(configs);
  //   expect(mockGetRepository).toBeCalledTimes(2);
  //   expect(mockGetRepository).toBeCalledWith(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);
  // });
  // it('Prematurely returns when finding 4 configs', async () => {
  //   const { mockSave, database, mockGetRepository } = createMockDB({ findReturn: [1, 2, 3, 4] });
  //   const dbService = new DatabaseService(database);

  //   await dbService.init();

  //   expect(mockSave).toBeCalledTimes(0);
  //   expect(mockGetRepository).toBeCalledTimes(1);
  //   expect(mockGetRepository).toBeCalledWith(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);
  // });
});

describe('DatabaseService: save', () => {
  it('Calls the correct methods to save data', async () => {
    const { database, mockSave, mockGetRepository } = createMockDB();
    const dbService = new DatabaseService(database);

    await dbService.save('entity', []);

    expect(mockSave).toBeCalledTimes(1);
    expect(mockSave).toBeCalledWith([]);
    expect(mockGetRepository).toBeCalledTimes(1);
    expect(mockGetRepository).toBeCalledWith('entity');
  });
  it('Returns saved data', async () => {
    const { database } = createMockDB();
    const dbService = new DatabaseService(database);

    const result = await dbService.save('entity', []);

    expect(result).toEqual([]);
  });
});

describe('DatabaseService: getAll', () => {
  it('Calls the correct methods to get all data for an entity', async () => {
    const { database, mockFind, mockGetRepository } = createMockDB();
    const dbService = new DatabaseService(database);

    await dbService.getAll('entity');

    expect(mockFind).toBeCalledTimes(1);
    expect(mockGetRepository).toBeCalledTimes(1);
    expect(mockGetRepository).toBeCalledWith('entity');
  });
  it('returns data', async () => {
    const { database } = createMockDB();
    const dbService = new DatabaseService(database);

    const result = await dbService.getAll('entity');

    expect(result).toEqual([]);
  });
});

describe('DatabaseService: upsert', () => {
  it('Correctly chunks when passed a lot of records', async () => {
    const { database, mockSave } = createMockDB();
    const dbService = new DatabaseService(database);

    const entities = Array.from({ length: 1000 }).map((_, i) => ({ id: i }));

    await dbService.upsert('entity', entities);

    expect(mockSave).toBeCalledTimes(2);
    expect(mockSave).toBeCalledWith(entities.slice(500));
    expect(mockSave).toBeCalledWith(entities.slice(500, 1000));
  });
  it('Correctly chunks when passed a small number of records', async () => {
    const { database, mockSave } = createMockDB();
    const dbService = new DatabaseService(database);

    const entities = Array.from({ length: 10 }).map((_, i) => ({ id: i }));

    await dbService.upsert('entity', entities);

    expect(mockSave).toBeCalledTimes(1);
    expect(mockSave).toBeCalledWith(entities);
  });
  it('Correctly does not chunk when not passing an array', async () => {
    const { database, mockSave } = createMockDB();
    const dbService = new DatabaseService(database);

    const entity = await dbService.upsert('entity', { id: 'a' });

    expect(mockSave).toBeCalledTimes(1);
    expect(mockSave).toBeCalledWith(entity);
  });
});

describe('DatabaseService: queryWith', () => {
  it('Calls the correct methods to get all data for an entity', async () => {
    const { database, mockFind, mockGetRepository } = createMockDB();
    const dbService = new DatabaseService(database);

    await dbService.queryWith('entity', {});

    expect(mockFind).toBeCalledTimes(1);
    expect(mockFind).toBeCalledWith({});
    expect(mockGetRepository).toBeCalledTimes(1);
    expect(mockGetRepository).toBeCalledWith('entity');
  });
  it('returns data', async () => {
    const { database } = createMockDB();
    const dbService = new DatabaseService(database);

    const result = await dbService.queryWith('entity', {});

    expect(result).toEqual([]);
  });
});

describe('DatabaseService: get', () => {
  it('Calls the correct methods to get a single entity', async () => {
    const { database, mockFindOne, mockGetRepository } = createMockDB();
    const dbService = new DatabaseService(database);

    const queryObject = { id: 'a' };
    await dbService.get('entity', queryObject);

    expect(mockFindOne).toBeCalledTimes(1);
    expect(mockFindOne).toBeCalledWith(queryObject);
    expect(mockGetRepository).toBeCalledTimes(1);
    expect(mockGetRepository).toBeCalledWith('entity');
  });
  it('returns data', async () => {
    const { database } = createMockDB();
    const dbService = new DatabaseService(database);

    const queryObject = { id: 'a' };
    const result = await dbService.get('entity', queryObject);

    expect(result).toEqual({});
  });
});

describe('DatabaseService: getWith', () => {
  it('Calls the correct methods to get a single entity', async () => {
    const { database, mockFindOne, mockGetRepository } = createMockDB();
    const dbService = new DatabaseService(database);

    const queryObject = { id: 'a' };
    await dbService.get('entity', queryObject);

    expect(mockFindOne).toBeCalledTimes(1);
    expect(mockFindOne).toBeCalledWith(queryObject);
    expect(mockGetRepository).toBeCalledTimes(1);
    expect(mockGetRepository).toBeCalledWith('entity');
  });
  it('returns data', async () => {
    const { database } = createMockDB();
    const dbService = new DatabaseService(database);

    const queryObject = { id: 'a' };
    const result = await dbService.get('entity', queryObject);

    expect(result).toEqual({});
  });
});

describe('DatabaseService: query', () => {
  it('Calls the correct methods for a generic query', async () => {
    const { database, mockFindOne } = createMockDB();
    const dbService = new DatabaseService(database);

    const query = 'query';
    await dbService.get('entity', query);

    expect(mockFindOne).toBeCalledTimes(1);
    expect(mockFindOne).toBeCalledWith(query);
  });
  it('returns data', async () => {
    const { database } = createMockDB();
    const dbService = new DatabaseService(database);

    const result = await dbService.query('entity', 'query');

    expect(result).toEqual({});
  });
});
