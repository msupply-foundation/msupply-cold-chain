import React, { FC, useEffect, useState } from 'react';

import { ENVIRONMENT } from '~common/constants';

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
  MigrationService,
} from '~services';

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
  DevManager,
} from '~features';

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
    const migrationService = new MigrationService(dbService, utilService);

    DependencyLocator.register('migrationService', migrationService);
    DependencyLocator.register('permissionService', permissionService);
    DependencyLocator.register('bleService', true ? devBtService : btService);
    DependencyLocator.register('database', dbService);
    DependencyLocator.register('formatService', formatService);
    DependencyLocator.register('utilService', utilService);
    DependencyLocator.register('exportService', exportService);
    DependencyLocator.register('loggerService', ENVIRONMENT.DEV_LOGGER ? devLogger : bugsnagLogger);

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

    DependencyLocator.register('breachConfigurationManager', breachConfigurationManager);
    DependencyLocator.register('sensorManager', sensorsManager);
    DependencyLocator.register('temperatureLogManager', temperatureLogManager);
    DependencyLocator.register('settingManager', settingManager);
    DependencyLocator.register('chartManager', chartManager);
    DependencyLocator.register('consecutiveBreachManager', consecutiveBreachManager);
    DependencyLocator.register('cumulativeBreachManager', cumulativeBreachManager);
    DependencyLocator.register('logTableManager', logTableManager);
    DependencyLocator.register('downloadManager', downloadManager);
    DependencyLocator.register('reportManager', reportManager);
    DependencyLocator.register('sensorStatusManager', sensorStatusManager);
    DependencyLocator.register('acknowledgeBreachManager', ackBreachManager);
    DependencyLocator.register('syncQueueManager', syncQueueManager);
    DependencyLocator.register('syncOutManager', syncOutManager);
    DependencyLocator.register('devManager', devManager);

    (async () => {
      await db.getConnection();
      await dbService.init();
      setReady(true);
    })();
  }, []);

  return ready ? (
    <DependencyLocatorContext.Provider value={DependencyLocator}>
      {children}
    </DependencyLocatorContext.Provider>
  ) : null;
};
