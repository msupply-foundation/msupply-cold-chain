import { createContext, useEffect, useState } from 'react';

import { BleManager } from 'react-native-ble-plx';

import { Database, DatabaseService } from '~database';
import { SERVICES } from '~constants';
import { DependencyLocator } from '~common/services';

import { DeviceService } from '../../services/device/DeviceService';
import { SensorManager } from '~sensor';

import { BleService } from '../../features/bluetooth';
import { SettingManager } from '../../features/setting/SettingManager';
import { BreachConfigurationManager } from '../../features/breachConfiguration';
import { ChartManager } from '../../features/chart';
import { BreachManager } from '../../features/breach';

import { LogTableManager } from '../../features/logTable';
import { DownloadManager } from '../../features/bluetooth/download';

const bleManager = new BleManager();

export const ServiceLocatorContext = createContext();

export const DependencyContainer = props => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);

    const db = new Database();
    const dbService = new DatabaseService(db);
    const deviceService = new DeviceService();
    const settingManager = new SettingManager(dbService);
    const breachConfigurationManager = new BreachConfigurationManager(dbService);
    const chartManager = new ChartManager(dbService);
    const breachManager = new BreachManager(dbService);
    const logTableManager = new LogTableManager(dbService);
    const downloadManager = new DownloadManager(dbService);

    (async () => {
      await db.getConnection();
      setReady(true);
    })();

    const sensorsManager = new SensorManager(dbService);

    const btService = new BleService(bleManager);

    DependencyLocator.register(SERVICES.BREACH_CONFIGURATION_MANAGER, breachConfigurationManager);
    DependencyLocator.register(SERVICES.SENSOR_MANAGER, sensorsManager);
    DependencyLocator.register(SERVICES.DEVICE, deviceService);
    DependencyLocator.register(SERVICES.BLUETOOTH, btService);
    DependencyLocator.register(SERVICES.DATABASE, dbService);
    DependencyLocator.register(SERVICES.SETTING_MANAGER, settingManager);
    DependencyLocator.register(SERVICES.CHART_MANAGER, chartManager);
    DependencyLocator.register(SERVICES.BREACH_MANAGER, breachManager);
    DependencyLocator.register(SERVICES.LOG_TABLE_MANAGER, logTableManager);
    DependencyLocator.register(SERVICES.DOWNLOAD_MANAGER, downloadManager);
  }, []);

  const { children } = props;

  return ready ? (
    <ServiceLocatorContext.Provider value={DependencyLocator}>
      {children}
    </ServiceLocatorContext.Provider>
  ) : null;
};
