import { createContext, useEffect, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';
import * as SplashScreen from 'expo-splash-screen';
import { DEPENDENCY } from '~constants';
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
import { ReportManager } from '../../features/Report';

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

    DependencyLocator.register(DEPENDENCY.DEVICE, deviceService);
    DependencyLocator.register(DEPENDENCY.BLUETOOTH, btService);
    DependencyLocator.register(DEPENDENCY.DATABASE, dbService);
    DependencyLocator.register(DEPENDENCY.FORMAT_SERVICE, formatService);
    DependencyLocator.register(DEPENDENCY.UTIL_SERVICE, utilService);
    DependencyLocator.register(DEPENDENCY.EXPORT_SERVICE, exportService);

    const settingManager = new SettingManager(dbService);
    const breachConfigurationManager = new BreachConfigurationManager(dbService);
    const chartManager = new ChartManager(dbService);
    const breachManager = new BreachManager(dbService, utilService);
    const logTableManager = new LogTableManager(dbService);
    const downloadManager = new DownloadManager(dbService, utilService);
    const sensorsManager = new SensorManager(dbService, utilService);
    const reportManager = new ReportManager(dbService, exportService, deviceService);

    DependencyLocator.register(DEPENDENCY.BREACH_CONFIGURATION_MANAGER, breachConfigurationManager);
    DependencyLocator.register(DEPENDENCY.SENSOR_MANAGER, sensorsManager);
    DependencyLocator.register(DEPENDENCY.SETTING_MANAGER, settingManager);
    DependencyLocator.register(DEPENDENCY.CHART_MANAGER, chartManager);
    DependencyLocator.register(DEPENDENCY.BREACH_MANAGER, breachManager);
    DependencyLocator.register(DEPENDENCY.LOG_TABLE_MANAGER, logTableManager);
    DependencyLocator.register(DEPENDENCY.DOWNLOAD_MANAGER, downloadManager);
    DependencyLocator.register(DEPENDENCY.REPORT_MANAGER, reportManager);

    (async () => {
      await db.getConnection();
      await dbService.init();
      setReady(true);
      SplashScreen.hideAsync();
    })();
  }, []);

  const { children } = props;

  return ready ? (
    <DependencyLocatorContext.Provider value={DependencyLocator}>
      {children}
    </DependencyLocatorContext.Provider>
  ) : null;
};
