import { Database } from '../../../../src/common/services/Database/Database';

describe('Database is constructed with correct values', () => {
  it('is constructed with the config passed', () => {
    const config = {};
    const db = new Database(config);

    expect(db.config).toEqual(config);
  });
  it('does not have a connection when first constructed', () => {
    const config = {};
    const db = new Database(config);

    expect(db.connection).toEqual(null);
  });
});

// describe('Connections are created correctly.', () => {
//   it('Creates and returns the correct connection object', () => {
//     const connection = {};
//     // createConnection = jest.fn(async () => connection);

//     const config = {};
//     const db = new Database(config);

//     return expect(db.createConnection()).resolves.toBe(connection);
//   });
//   it('Creates a connection with the databases config', async () => {
//     const connection = {};
//     createConnection = jest.fn(async () => connection);

//     const config = {};
//     const db = new Database(config);

//     await db.createConnection();

//     expect(createConnection).toBeCalledWith(config);
//     expect(createConnection).toBeCalledTimes(1);
//   });
//   it('Stores the connection internally', async () => {
//     const connection = {};
//     createConnection = jest.fn(async () => connection);

//     const config = {};
//     const db = new Database(config);

//     await db.createConnection();

//     expect(db.connection).toBe(connection);
//   });
// });

// describe('Get connection always returns a connection object.', () => {
//   it('returns a connection object when only just initialized.', async () => {
//     const connection = {};
//     createConnection = jest.fn(async () => connection);

//     const config = {};
//     const db = new Database(config);

//     const conn = await db.getConnection();

//     expect(conn).toBe(connection);
//   });
//   it('returns the same connection object after creating it.', async () => {
//     const connection = {};
//     createConnection = jest.fn(async () => connection);

//     const config = {};
//     const db = new Database(config);

//     const conn = await db.getConnection();
//     const conn2 = await db.getConnection();

//     expect(conn2).toBe(conn);
//     expect(conn2).toBe(connection);
//   });
// });

// describe('Returns a specific repository object', () => {
//   it('returns a repo object', async () => {
//     const repo = {};
//     const connection = { getRepository: async () => repo };
//     createConnection = jest.fn(async () => connection);

//     const config = {};
//     const db = new Database(config);

//     const toBe = await db.getRepository();

//     expect(repo).toBe(toBe);
//   });
// });

// describe('', () => {
//   it('', () => {
//     const config = getDefaultDatabaseConfig();
//     expect(config).toMatchSnapshot();
//   });
//   it('', () => {
//     const env = ENVIRONMENT;
//     env.QUERY_LOGGER = false;
//     const config = getDefaultDatabaseConfig();
//     expect(config).toMatchSnapshot();
//   });
//   it('', () => {
//     const db = new Database();
//     const config = getDefaultDatabaseConfig();
//     expect(db.config).toEqual(config);
//   });
// });
