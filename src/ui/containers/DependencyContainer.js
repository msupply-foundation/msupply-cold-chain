import { createContext, useEffect, useState } from 'react';

import { BleManager } from 'react-native-ble-plx';
import { SERVICES } from '~constants';
import {
  Database,
  DependencyLocator,
  BleService,
  DeviceFeatureService,
  DatabaseService,
  ExportService,
  UtilService,
  FormatService,
} from '~common/services';

import { SensorManager } from '~sensor';
import { SettingManager } from '../../features/setting/SettingManager';
import { BreachConfigurationManager } from '../../features/breachConfiguration';
import { ChartManager } from '../../features/chart';
import { BreachManager } from '../../features/breach';
import { LogTableManager } from '../../features/logTable';
import { DownloadManager } from '../../features/bluetooth/download';

const bleManager = new BleManager();

export const DependencyLocatorContext = createContext();

export const DependencyContainer = props => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);

    const db = new Database();
    const dbService = new DatabaseService(db);
    const deviceService = new DeviceFeatureService();
    const btService = new BleService(bleManager);
    const formatService = new FormatService();
    const utilService = new UtilService();
    const exportService = new ExportService();

    DependencyLocator.register(SERVICES.DEVICE, deviceService);
    DependencyLocator.register(SERVICES.BLUETOOTH, btService);
    DependencyLocator.register(SERVICES.DATABASE, dbService);
    DependencyLocator.register(SERVICES.FORMAT_SERVICE, formatService);
    DependencyLocator.register(SERVICES.UTIL_SERVICE, utilService);
    DependencyLocator.register(SERVICES.EXPORT_SERVICE, exportService);

    const settingManager = new SettingManager(dbService);
    const breachConfigurationManager = new BreachConfigurationManager(dbService);
    const chartManager = new ChartManager(dbService);
    const breachManager = new BreachManager(dbService, utilService);
    const logTableManager = new LogTableManager(dbService);
    const downloadManager = new DownloadManager(dbService, utilService);
    const sensorsManager = new SensorManager(dbService, utilService);

    DependencyLocator.register(SERVICES.BREACH_CONFIGURATION_MANAGER, breachConfigurationManager);
    DependencyLocator.register(SERVICES.SENSOR_MANAGER, sensorsManager);
    DependencyLocator.register(SERVICES.SETTING_MANAGER, settingManager);
    DependencyLocator.register(SERVICES.CHART_MANAGER, chartManager);
    DependencyLocator.register(SERVICES.BREACH_MANAGER, breachManager);
    DependencyLocator.register(SERVICES.LOG_TABLE_MANAGER, logTableManager);
    DependencyLocator.register(SERVICES.DOWNLOAD_MANAGER, downloadManager);

    (async () => {
      await db.getConnection();
      setReady(true);
    })();
  }, []);

  const { children } = props;

  return ready ? (
    <DependencyLocatorContext.Provider value={DependencyLocator}>
      {children}
    </DependencyLocatorContext.Provider>
  ) : null;
};
