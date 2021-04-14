import React, { FC, useEffect, useState } from 'react';

import * as SplashScreen from 'expo-splash-screen';

import { DEPENDENCY, ENVIRONMENT } from '../../common/constants';

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
  DevService,
  DevBleManager,
  DependencyLocatorContext,
} from '../../common/services';

import {
  SensorStatusManager,
  ReportManager,
  DownloadManager,
  LogTableManager,
  ChartManager,
  CumulativeBreachManager,
  ConsecutiveBreachManager,
  AcknowledgeBreachManager,
  BreachConfigurationManager,
  SettingManager,
  SensorManager,
  TemperatureLogManager,
  SyncQueueManager,
  SyncOutManager,
  DevManager
} from '../../features';

export const DependencyContainer: FC = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const db = new Database();
    const dbService = new DatabaseService(db);
    const permissionService = new PermissionService();
    const btService = new BleService();
    const devBtService = new BleService(new DevBleManager());
    const formatService = new FormatService();
    const utilService = new UtilService();
    const exportService = new ExportService();
    const devLogger = new DevLoggerService();
    const bugsnagLogger = new BugsnagLoggerService();
    const devService = new DevService();

    DependencyLocator.register(DEPENDENCY.PERMISSION_SERVICE, permissionService);
    DependencyLocator.register(
      DEPENDENCY.BLUETOOTH,
      ENVIRONMENT.MOCK_BLE ? devBtService : btService
    );
    DependencyLocator.register(DEPENDENCY.DATABASE, dbService);
    DependencyLocator.register(DEPENDENCY.FORMAT_SERVICE, formatService);
    DependencyLocator.register(DEPENDENCY.UTIL_SERVICE, utilService);
    DependencyLocator.register(DEPENDENCY.EXPORT_SERVICE, exportService);
    DependencyLocator.register(
      DEPENDENCY.LOGGER_SERVICE,
      ENVIRONMENT.DEV_LOGGER ? devLogger : bugsnagLogger
    );

    const settingManager = new SettingManager(dbService);
    const breachConfigurationManager = new BreachConfigurationManager(dbService);
    const chartManager = new ChartManager(dbService);
    const consecutiveBreachManager = new ConsecutiveBreachManager(dbService, utilService);
    const cumulativeBreachManager = new CumulativeBreachManager(dbService);
    const ackBreachManager = new AcknowledgeBreachManager(dbService);
    const logTableManager = new LogTableManager(dbService);
    const downloadManager = new DownloadManager(dbService, utilService);
    const sensorsManager = new SensorManager(dbService, utilService);
    const temperatureLogManager = new TemperatureLogManager(dbService, utilService);
    const reportManager = new ReportManager(dbService, exportService, permissionService);
    const sensorStatusManager = new SensorStatusManager(dbService);
    const syncQueueManager = new SyncQueueManager(dbService);
    const syncOutManager = new SyncOutManager();
    const devManager = new DevManager(dbService, utilService, devService);

    DependencyLocator.register(DEPENDENCY.BREACH_CONFIGURATION_MANAGER, breachConfigurationManager);
    DependencyLocator.register(DEPENDENCY.SENSOR_MANAGER, sensorsManager);
    DependencyLocator.register(DEPENDENCY.TEMPERATURE_LOG_MANAGER, temperatureLogManager);
    DependencyLocator.register(DEPENDENCY.SETTING_MANAGER, settingManager);
    DependencyLocator.register(DEPENDENCY.CHART_MANAGER, chartManager);
    DependencyLocator.register(DEPENDENCY.CONSECUTIVE_BREACH_MANAGER, consecutiveBreachManager);
    DependencyLocator.register(DEPENDENCY.CUMULATIVE_BREACH_MANAGER, cumulativeBreachManager);
    DependencyLocator.register(DEPENDENCY.LOG_TABLE_MANAGER, logTableManager);
    DependencyLocator.register(DEPENDENCY.DOWNLOAD_MANAGER, downloadManager);
    DependencyLocator.register(DEPENDENCY.REPORT_MANAGER, reportManager);
    DependencyLocator.register(DEPENDENCY.SENSOR_STATUS_MANAGER, sensorStatusManager);
    DependencyLocator.register(DEPENDENCY.ACKNOWLEDGE_BREACH_MANAGER, ackBreachManager);
    DependencyLocator.register(DEPENDENCY.SYNC_QUEUE_MANAGER, syncQueueManager);
    DependencyLocator.register(DEPENDENCY.SYNC_OUT_MANAGER, syncOutManager);
    DependencyLocator.register(DEPENDENCY.DEV_MANAGER, devManager);

    (async () => {
      await db.getConnection();
      await dbService.init();

      setReady(true);
      SplashScreen.hideAsync();
    })();
  }, []);

  return ready ? (
    <DependencyLocatorContext.Provider value={DependencyLocator}>
      {children}
    </DependencyLocatorContext.Provider>
  ) : null;
};
