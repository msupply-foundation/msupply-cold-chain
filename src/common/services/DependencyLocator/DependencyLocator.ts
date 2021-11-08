import { BtUtilService } from 'msupply-ble-service';
import {
  AcknowledgeBreachManager,
  CumulativeBreachManager,
  SensorStatusManager,
  DownloadManager,
  LogTableManager,
  BreachConfigurationManager,
  ChartManager,
  ConsecutiveBreachManager,
  ReportManager,
  SensorManager,
  SettingManager,
  SyncQueueManager,
  SyncOutManager,
  TemperatureLogManager,
  DevManager,
} from '~features';

import {
  Database,
  DatabaseService,
  ExportService,
  FormatService,
  UtilService,
  PermissionService,
  DevLoggerService,
  MigrationService,
} from '~services';

export enum DepKey {
  syncQueueManager = 'syncQueueManager',
}

export type DependencyKey =
  | 'migrationService'
  | 'dependencyLocator'
  | 'bleService'
  | 'btUtilService'
  | 'database'
  | 'permissionService'
  | 'loggerService'
  | 'exportService'
  | 'formatService'
  | 'utilService'
  | 'sensorManager'
  | 'temperatureLogManager'
  | 'settingManager'
  | 'chartManager'
  | 'logTableManager'
  | 'devManager'
  | 'downloadManager'
  | 'reportManager'
  | 'sensorStatusManager'
  | 'consecutiveBreachManager'
  | 'cumulativeBreachManager'
  | 'acknowledgeBreachManager'
  | 'syncQueueManager'
  | 'syncOutManager'
  | 'breachConfigurationManager';

export type Dependency =
  | BleService
  | BtUtilService
  | DatabaseService
  | ExportService
  | FormatService
  | UtilService
  | PermissionService
  | DevLoggerService
  | SensorManager
  | SettingManager
  | BreachConfigurationManager
  | ChartManager
  | LogTableManager
  | DownloadManager
  | ReportManager
  | SensorStatusManager
  | ConsecutiveBreachManager
  | CumulativeBreachManager
  | AcknowledgeBreachManager
  | SyncQueueManager
  | SyncOutManager;

export interface DependencyShape {
  migrationService?: MigrationService;
  dependencyLocator?: DependencyLocator;
  bleService?: BleService;
  btUtilService?: BtUtilService;
  database?: Database;
  permissionService?: PermissionService;
  loggerService?: DevLoggerService;
  exportService?: ExportService;
  formatService?: FormatService;
  utilService?: UtilService;
  sensorManager?: SensorManager;
  temperatureLogManager?: TemperatureLogManager;
  settingManager?: SettingManager;
  chartManager?: ChartManager;
  logTableManager?: LogTableManager;
  devManager?: DevManager;
  downloadManager?: DownloadManager;
  reportManager?: ReportManager;
  sensorStatusManager?: SensorStatusManager;
  consecutiveBreachManager?: ConsecutiveBreachManager;
  cumulativeBreachManager?: CumulativeBreachManager;
  acknowledgeBreachManager?: AcknowledgeBreachManager;
  syncQueueManager?: SyncQueueManager;
  syncOutManager?: SyncOutManager;
  breachConfigurationManager?: BreachConfigurationManager;
}

export class DependencyLocator {
  dependencies: DependencyShape;

  constructor() {
    this.dependencies = {};
  }

  // TODO Make two functions, get / getMany
  get = (keyOrKeys: DependencyKey | DependencyKey[]): Dependency | Dependency[] | undefined => {
    if (Array.isArray(keyOrKeys)) {
      const depsArray = keyOrKeys.map(key => this.get(key));
      return depsArray;
    }
    return this.dependencies[keyOrKeys];
  };

  register = (key: DependencyKey, dependency: Dependency): boolean => {
    if (key === 'bleService') {
      this.dependencies.bleService = dependency as BleService;
    } else if (key === 'btUtilService') {
      this.dependencies.btUtilService = dependency as BtUtilService;
    } else if (key === 'acknowledgeBreachManager') {
      this.dependencies.acknowledgeBreachManager = dependency as AcknowledgeBreachManager;
    } else if (key === 'breachConfigurationManager') {
      this.dependencies.breachConfigurationManager = dependency as BreachConfigurationManager;
    } else if (key === 'chartManager') {
      this.dependencies.chartManager = dependency as ChartManager;
    } else if (key === 'consecutiveBreachManager') {
      this.dependencies.consecutiveBreachManager = dependency as ConsecutiveBreachManager;
    } else if (key === 'cumulativeBreachManager') {
      this.dependencies.cumulativeBreachManager = dependency as CumulativeBreachManager;
    } else if (key === 'database') {
      this.dependencies.database = dependency as Database;
    } else if (key === 'devManager') {
      this.dependencies.devManager = dependency as DevManager;
    } else if (key === 'downloadManager') {
      this.dependencies.downloadManager = dependency as DownloadManager;
    } else if (key === 'exportService') {
      this.dependencies.exportService = dependency as ExportService;
    } else if (key === 'formatService') {
      this.dependencies.formatService = dependency as FormatService;
    } else if (key === 'logTableManager') {
      this.dependencies.logTableManager = dependency as LogTableManager;
    } else if (key === 'loggerService') {
      this.dependencies.loggerService = dependency as DevLoggerService;
    } else if (key === 'migrationService') {
      this.dependencies.migrationService = dependency as MigrationService;
    } else if (key === 'permissionService') {
      this.dependencies.permissionService = dependency as PermissionService;
    } else if (key === 'reportManager') {
      this.dependencies.reportManager = dependency as ReportManager;
    } else if (key === 'sensorManager') {
      this.dependencies.sensorManager = dependency as SensorManager;
    } else if (key === 'sensorStatusManager') {
      this.dependencies.sensorStatusManager = dependency as SensorStatusManager;
    } else if (key === 'settingManager') {
      this.dependencies.settingManager = dependency as SettingManager;
    } else if (key === 'syncOutManager') {
      this.dependencies.syncOutManager = dependency as SyncOutManager;
    } else if (key === 'syncQueueManager') {
      this.dependencies.syncQueueManager = dependency as SyncQueueManager;
    } else if (key === 'temperatureLogManager') {
      this.dependencies.temperatureLogManager = dependency as TemperatureLogManager;
    } else if (key === 'utilService') {
      this.dependencies.utilService = dependency as UtilService;
    } else {
      throw new Error(`Trying to register an unsupported dependency key: ${key}`);
    }

    return true;
  };

  deleteAll = (): void => {
    if (__DEV__) {
      this.dependencies = {};
    } else {
      throw new Error('Unable to delete dependencies registry in a production build');
    }
  };
}

export default new DependencyLocator();
