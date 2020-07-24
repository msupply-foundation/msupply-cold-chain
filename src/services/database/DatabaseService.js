export class DatabaseService {
  constructor(database) {
    this.database = database;
  }

  getAll = async () => {
    const connection = this.database.getConnection();

    return connection.find();
  };

  upsert = async (entityName, object) => {
    const repository = this.database.getRepository(entityName);

    return repository.save(object);
  };

  queryWith = async (entityName, queryObject) => {
    const repository = this.database.getRepository(entityName);

    return repository.find(queryObject);
  };
}
