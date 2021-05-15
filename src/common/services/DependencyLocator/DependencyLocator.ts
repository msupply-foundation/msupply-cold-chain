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
  BleService,
  DatabaseService,
  ExportService,
  FormatService,
  UtilService,
  PermissionService,
  DevLoggerService,
  MigrationService,
} from '~services';

export type DependencyKey =
  | 'migrationService'
  | 'dependencyLocator'
  | 'bleService'
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

interface DependencyShape {
  migrationService: MigrationService;
  dependencyLocator: DependencyLocator;
  bleService: BleService;
  database: Database;
  permissionService: PermissionService;
  loggerService: DevLoggerService;
  exportService: ExportService;
  formatService: FormatService;
  utilService: UtilService;
  sensorManager: SensorManager;
  temperatureLogManager: TemperatureLogManager;
  settingManager: SettingManager;
  chartManager: ChartManager;
  logTableManager: LogTableManager;
  devManager: DevManager;
  downloadManager: DownloadManager;
  reportManager: ReportManager;
  sensorStatusManager: SensorStatusManager;
  consecutiveBreachManager: ConsecutiveBreachManager;
  cumulativeBreachManager: CumulativeBreachManager;
  acknowledgeBreachManager: AcknowledgeBreachManager;
  syncQueueManager: SyncQueueManager;
  syncOutManager: SyncOutManager;
  breachConfigurationManager: BreachConfigurationManager;
}

class DependencyLocator {
  dependencies: Partial<DependencyShape>;

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

  register = (key: DependencyKey, dependency: Dependency) => {
    this.dependencies[key] = dependency;

    return true;
  };

  deleteAll = () => {
    if (__DEV__) {
      this.dependencies = {};
    } else {
      throw new Error();
    }
  };
}

export default new DependencyLocator();
