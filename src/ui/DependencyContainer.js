import { useEffect, useState, createContext } from 'react';
import { useDispatch } from 'react-redux';
import { Database, DatabaseService } from '~database';
import { BluetoothService } from '~bluetooth/BluetoothService';

const DatabaseServiceContext = createContext({});
const BluetoothServiceContext = createContext({});

export const DependencyContainer = props => {
  const [databaseService, setDatabaseService] = useState({});
  const [bluetoothService, setBluetoothService] = useState({});
  const dispatch = useDispatch();

  // When mounting, set up the app dependencies. This is ...
  // ... where all dependencies should be instantiated   ...
  // ... and imported. If you require some dependency    ...
  // ... elsewhere, then you should instantiate it here  ...
  // ... and drill it down or pass within some context.
  useEffect(() => {
    const db = new Database();
    const dbService = new DatabaseService(db);
    const btService = new BluetoothService();

    setBluetoothService(btService);
    setDatabaseService(dbService);

    dispatch({ type: 'setBluetoothService', payload: { bluetoothService: btService } });
    dispatch({ type: 'setDatabaseService', payload: { bluetoothService: dbService } });
  }, []);

  const { children } = props;

  return (
    <BluetoothServiceContext.Provider value={bluetoothService}>
      <DatabaseServiceContext.Provider value={databaseService}>
        {children}
      </DatabaseServiceContext.Provider>
    </BluetoothServiceContext.Provider>
  );
};
