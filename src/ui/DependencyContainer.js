import { useEffect, createContext, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';

import { Database, DatabaseService } from '~database';
import { SERVICES } from '~constants';
import { registerService, getService } from '~services';

import { DeviceService } from '~services/device/DeviceService';
import { SensorManager } from '~sensor';

import { DatabaseUtilsService } from '../services/database/DatabaseUtilsService';
import { Ble } from '../services/bluetooth/Ble';
import { SettingManager } from '../features/setting/SettingManager';
import { BreachConfigurationManager } from '../features/breachConfiguration';

const ServiceLocatorContext = createContext(null);

const bleManager = new BleManager();

export const DependencyContainer = props => {
  const [ready, setReady] = useState(false);

  // When mounting, set up the app dependencies. This is ...
  // ... where all dependencies should be instantiated   ...
  // ... and imported. If you require some dependency    ...
  // ... elsewhere, then you should instantiate it here  ...
  // ... and drill it down or pass within some context.
  useEffect(() => {
    const db = new Database();
    const dbService = new DatabaseService(db);
    const deviceService = new DeviceService();
    const dbUtilsService = new DatabaseUtilsService();
    const settingManager = new SettingManager(dbService);
    const breachConfigurationManager = new BreachConfigurationManager(dbService);

    (async () => {
      await db.getConnection();
      setReady(true);
    })();
    const sensorsManager = new SensorManager(dbService);

    // let btService = new BluetoothService();
    // if (__DEV__) {
    //   btService = new DevBluetoothService();
    // }

    const btService = new Ble(bleManager);

    registerService(SERVICES.BREACH_CONFIGURATION_MANAGER, breachConfigurationManager);
    registerService(SERVICES.SENSOR_MANAGER, sensorsManager);
    registerService(SERVICES.DATABASE_UTILS, dbUtilsService);
    registerService(SERVICES.DEVICE, deviceService);
    registerService(SERVICES.BLUETOOTH, btService);
    registerService(SERVICES.DATABASE, dbService);

    registerService(SERVICES.SETTING_MANAGER, settingManager);
  }, []);

  const { children } = props;

  return (
    <ServiceLocatorContext.Provider value={getService}>
      {ready ? children : null}
    </ServiceLocatorContext.Provider>
  );
};
