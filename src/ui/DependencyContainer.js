import { useEffect, useState, createContext } from 'react';

import { Database, DatabaseService } from '~database';

const DatabaseServiceContext = createContext({});

export const DependencyContainer = props => {
  const [databaseService, setDatabaseService] = useState({});

  // When mounting, set up the app dependencies. This is ...
  // ... where all dependencies should be instantiated   ...
  // ... and imported. If you require some dependency    ...
  // ... elsewhere, then you should instantiate it here  ...
  // ... and drill it down or pass within some context.
  useEffect(() => {
    const db = new Database();
    const dbService = new DatabaseService(db);

    setDatabaseService(dbService);
  }, []);

  const { children } = props;

  return (
    <DatabaseServiceContext.Provider value={databaseService}>
      {children}
    </DatabaseServiceContext.Provider>
  );
};
