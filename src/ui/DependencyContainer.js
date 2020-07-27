import { useEffect, createContext } from 'react';

import { Database, DatabaseService } from '~database';
import { BluetoothService } from '~bluetooth';
import { registerService, getService } from '~services';
import { SERVICES } from '~constants';

const ServiceLocatorContext = createContext(null);

export const DependencyContainer = props => {
  // When mounting, set up the app dependencies. This is ...
  // ... where all dependencies should be instantiated   ...
  // ... and imported. If you require some dependency    ...
  // ... elsewhere, then you should instantiate it here  ...
  // ... and drill it down or pass within some context.
  useEffect(() => {
    const db = new Database();
    const dbService = new DatabaseService(db);
    const btService = new BluetoothService();

    registerService(SERVICES.BLUETOOTH, btService);
    registerService(SERVICES.DATABASE, dbService);
  }, []);

  const { children } = props;

  return (
    <ServiceLocatorContext.Provider value={getService}>{children}</ServiceLocatorContext.Provider>
  );
};
