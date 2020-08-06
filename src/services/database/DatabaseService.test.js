import { ENTITIES } from '~constants';
import { DatabaseService } from './DatabaseService';

const remove = jest.fn(async () => {});
const find = jest.fn(async () => {});
const save = jest.fn(async arg => arg);
const createQueryBuilder = jest.fn(async () => {});
const getRepository = jest.fn(async () => ({ remove, find, save, createQueryBuilder }));
const getConnection = jest.fn(async () => ({ getRepository }));
function MockDatabase() {}
MockDatabase.prototype.getConnection = getConnection;
MockDatabase.prototype.getRepository = async (...args) => {
  return (await getConnection()).getRepository(...args);
};

// Clear all mocks functions of their call trees
beforeEach(() => jest.clearAllMocks());

describe('DB Service: Delete', () => {
  it('Calls the correct things when calling delete', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.delete();

    expect(remove.mock.calls.length).toBe(1);
    expect(getConnection.mock.calls.length).toBe(1);
    expect(getRepository.mock.calls.length).toBe(1);
  });
  it('Calls getConnection with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.delete();
    // Not called with any params
    expect(getConnection.mock.calls[0].length).toBe(0);
  });
  it('Calls getRepository with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';
    const entities = [];
    await dbService.delete(entityName, entities);

    expect(getRepository.mock.calls[0].length).toBe(1);
    expect(getRepository.mock.calls[0][0]).toBe(entityName);
  });
  it('Calls remove with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';
    const entities = [];
    await dbService.delete(entityName, entities);

    expect(remove.mock.calls[0].length).toBe(1);
    expect(remove.mock.calls[0][0]).toBe(entities);
  });
});

describe('DB Service: getAll', () => {
  it('Calls the correct things when calling getAll', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.delete();

    expect(find.mock.calls.length).toBe(0);
    expect(getRepository.mock.calls.length).toBe(1);
    expect(getConnection.mock.calls.length).toBe(1);
  });
  it('Calls getConnection with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.getAll();
    // Not called with any params
    expect(getConnection.mock.calls[0].length).toBe(0);
  });
  it('Calls getRepository with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';
    await dbService.getAll(entityName);

    expect(getRepository.mock.calls[0].length).toBe(1);
    expect(getRepository.mock.calls[0][0]).toBe(entityName);
  });
  it('Calls find with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';

    await dbService.getAll(entityName);

    expect(find.mock.calls[0].length).toBe(0);
    expect(find.mock.calls[0][0]).toBe(undefined);
  });
});

describe('DB Service: upsert', () => {
  it('Calls the correct things when calling upsert', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.upsert();

    expect(save.mock.calls.length).toBe(1);
    expect(getRepository.mock.calls.length).toBe(1);
    expect(getConnection.mock.calls.length).toBe(1);
  });
  it('Calls getConnection with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.upsert();
    // Not called with any params
    expect(getConnection.mock.calls[0].length).toBe(0);
  });
  it('Calls getRepository with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';
    await dbService.upsert(entityName);

    expect(getRepository.mock.calls[0].length).toBe(1);
    expect(getRepository.mock.calls[0][0]).toBe(entityName);
  });
  it('Calls upsert with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';
    const entity = {};
    await dbService.upsert(entityName, entity);

    expect(save.mock.calls[0].length).toBe(1);
    expect(save.mock.calls[0][0]).toBe(entity);
  });
});

describe('DB Service: queryWith', () => {
  it('Calls the correct things when calling queryWith', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.queryWith();

    expect(find.mock.calls.length).toBe(1);
    expect(getRepository.mock.calls.length).toBe(1);
    expect(getConnection.mock.calls.length).toBe(1);
  });
  it('Calls getConnection with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.upsert();
    // Not called with any params
    expect(getConnection.mock.calls[0].length).toBe(0);
  });
  it('Calls getRepository with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';

    await dbService.queryWith(entityName);

    expect(getRepository.mock.calls[0].length).toBe(1);
    expect(getRepository.mock.calls[0][0]).toBe(entityName);
  });
  it('Calls queryWith with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';
    const entity = {};
    await dbService.queryWith(entityName, entity);

    expect(find.mock.calls[0].length).toBe(1);
    expect(find.mock.calls[0][0]).toBe(entity);
  });
});

describe('DB Service: getQueryBuilder', () => {
  it('Calls the correct things when calling queryWith', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.getQueryBuilder();

    expect(createQueryBuilder.mock.calls.length).toBe(1);
    expect(getRepository.mock.calls.length).toBe(1);
    expect(getConnection.mock.calls.length).toBe(1);
  });
  it('Calls getConnection with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    await dbService.getQueryBuilder();
    // Not called with any params
    expect(getConnection.mock.calls[0].length).toBe(0);
  });
  it('Calls getRepository with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';

    await dbService.getQueryBuilder(entityName);

    expect(getRepository.mock.calls[0].length).toBe(1);
    expect(getRepository.mock.calls[0][0]).toBe(entityName);
  });
  it('Calls getQueryBuilder with the correct parameters', async () => {
    const dbService = new DatabaseService(new MockDatabase());
    const entityName = 'EntityName';
    const alias = 'en';
    await dbService.getQueryBuilder(entityName, alias);

    expect(createQueryBuilder.mock.calls[0].length).toBe(1);
    expect(createQueryBuilder.mock.calls[0][0]).toBe(alias);
  });
});

describe('DatabaseService: saveLogs', () => {
  it('Saves and returns logs passed', async () => {
    const dbService = new DatabaseService(new MockDatabase());

    const sensorId = '1';
    const id = '1';

    const logsToSave = [
      { sensorId, id, temperature: 1, timestamp: 0 },
      { sensorId, id, temperature: 1, timestamp: 0 },
    ];

    const result = await dbService.saveSensorLogs(logsToSave);

    expect(result).toEqual(logsToSave);
  });
  it('calls the underlying database interface with the correct calls', async () => {
    const dbService = new DatabaseService(new MockDatabase());

    const sensorId = '1';
    const id = '1';

    const logsToSave = [
      { sensorId, id, temperature: 1, timestamp: 0 },
      { sensorId, id, temperature: 1, timestamp: 0 },
    ];

    await dbService.saveSensorLogs(logsToSave);

    expect(save.mock.calls.length).toEqual(1);
    expect(save.mock.calls[0].length).toEqual(1);
    expect(save.mock.calls[0][0]).toEqual(logsToSave);

    expect(getRepository.mock.calls.length).toEqual(1);
    expect(getRepository.mock.calls[0].length).toEqual(1);
    expect(getRepository.mock.calls[0][0]).toEqual(ENTITIES.SENSOR_LOG);
  });
});
