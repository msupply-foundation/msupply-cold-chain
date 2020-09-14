import { useEffect, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';
import * as SplashScreen from 'expo-splash-screen';

import { DEPENDENCY } from '~constants';

import {
  Database,
  DependencyLocator,
  BleService,
  PermissionService,
  DatabaseService,
  ExportService,
  UtilService,
  FormatService,
  BugsnagLoggerService,
  DevLoggerService,
  DependencyLocatorContext,
} from '~common/services';

import {
  SensorStatusManager,
  ReportManager,
  DownloadManager,
  LogTableManager,
  CumulativeBreachManager,
  ConsecutiveBreachManager,
  ChartManager,
  BreachConfigurationManager,
  SettingManager,
  SensorManager,
} from '~features';

const bleManager = new BleManager();

export const DependencyContainer = props => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const db = new Database();
    const dbService = new DatabaseService(db);
    const permissionService = new PermissionService();
    const btService = new BleService(bleManager);
    const formatService = new FormatService();
    const utilService = new UtilService();
    const exportService = new ExportService();
    const devLogger = new DevLoggerService();
    const bugsnagLogger = new BugsnagLoggerService();

    DependencyLocator.register(DEPENDENCY.PERMISSION_SERVICE, permissionService);
    DependencyLocator.register(DEPENDENCY.BLUETOOTH, btService);
    DependencyLocator.register(DEPENDENCY.DATABASE, dbService);
    DependencyLocator.register(DEPENDENCY.FORMAT_SERVICE, formatService);
    DependencyLocator.register(DEPENDENCY.UTIL_SERVICE, utilService);
    DependencyLocator.register(DEPENDENCY.EXPORT_SERVICE, exportService);
    DependencyLocator.register(DEPENDENCY.LOGGER_SERVICE, __DEV__ ? devLogger : bugsnagLogger);

    const settingManager = new SettingManager(dbService);
    const breachConfigurationManager = new BreachConfigurationManager(dbService);
    const chartManager = new ChartManager(dbService);
    const consecutiveBreachManager = new ConsecutiveBreachManager(dbService, utilService);
    const cumulativeBreachManager = new CumulativeBreachManager(dbService);
    const logTableManager = new LogTableManager(dbService);
    const downloadManager = new DownloadManager(dbService, utilService);
    const sensorsManager = new SensorManager(dbService, utilService);
    const reportManager = new ReportManager(dbService, exportService, permissionService);
    const sensorStatusManager = new SensorStatusManager(dbService);

    DependencyLocator.register(DEPENDENCY.BREACH_CONFIGURATION_MANAGER, breachConfigurationManager);
    DependencyLocator.register(DEPENDENCY.SENSOR_MANAGER, sensorsManager);
    DependencyLocator.register(DEPENDENCY.SETTING_MANAGER, settingManager);
    DependencyLocator.register(DEPENDENCY.CHART_MANAGER, chartManager);
    DependencyLocator.register(DEPENDENCY.CONSECUTIVE_BREACH_MANAGER, consecutiveBreachManager);
    DependencyLocator.register(DEPENDENCY.CUMULATIVE_BREACH_MANAGER, cumulativeBreachManager);
    DependencyLocator.register(DEPENDENCY.LOG_TABLE_MANAGER, logTableManager);
    DependencyLocator.register(DEPENDENCY.DOWNLOAD_MANAGER, downloadManager);
    DependencyLocator.register(DEPENDENCY.REPORT_MANAGER, reportManager);
    DependencyLocator.register(DEPENDENCY.SENSOR_STATUS_MANAGER, sensorStatusManager);

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
