import { DEPENDENCY } from '../../constants';
import { AcknowledgeBreachManager } from '../../../features/Breach/AcknowledgeBreach/AcknowledgeBreachManager';
import { CumulativeBreachManager } from '../../../features/Breach/CumulativeBreach/CumulativeBreachManager';
import { SensorStatusManager } from '../../../features/SensorStatus/SensorStatusManager';
import { DownloadManager } from '../../../features/Bluetooth/Download/DownloadManager';
import { LogTableManager } from '../../../features/SensorDetail/LogTable/LogTableManager';
import {
  BreachConfigurationManager,
  ChartManager,
  ConsecutiveBreachManager,
  ReportManager,
  SensorManager,
  SettingManager,
} from '../../../features';
import { BleService } from '../Bluetooth/BleService';
import { DatabaseService } from '../Database';
import { ExportService } from '../ExportService';
import { FormatService } from '../FormatService';
import { UtilService } from '../UtilService';
import { PermissionService } from '../PermissionService';
import { DevLoggerService } from '../LoggerService';

export interface Dependencies {
  [DEPENDENCY.BLUETOOTH]?: BleService;
  [DEPENDENCY.DATABASE]?: DatabaseService;
  [DEPENDENCY.EXPORT_SERVICE]?: ExportService;
  [DEPENDENCY.FORMAT_SERVICE]?: FormatService;
  [DEPENDENCY.UTIL_SERVICE]?: UtilService;
  [DEPENDENCY.PERMISSION_SERVICE]?: PermissionService;
  [DEPENDENCY.LOGGER_SERVICE]?: DevLoggerService;
  [DEPENDENCY.SENSOR_MANAGER]?: SensorManager;
  [DEPENDENCY.SETTING_MANAGER]?: SettingManager;
  [DEPENDENCY.BREACH_CONFIGURATION_MANAGER]?: BreachConfigurationManager;
  [DEPENDENCY.CHART_MANAGER]?: ChartManager;
  [DEPENDENCY.LOG_TABLE_MANAGER]?: LogTableManager;
  [DEPENDENCY.DOWNLOAD_MANAGER]?: DownloadManager;
  [DEPENDENCY.REPORT_MANAGER]?: ReportManager;
  [DEPENDENCY.SENSOR_STATUS_MANAGER]?: SensorStatusManager;
  [DEPENDENCY.CONSECUTIVE_BREACH_MANAGER]?: ConsecutiveBreachManager;
  [DEPENDENCY.CUMULATIVE_BREACH_MANAGER]?: CumulativeBreachManager;
  [DEPENDENCY.ACKNOWLEDGE_BREACH_MANAGER]?: AcknowledgeBreachManager;
}

class DependencyLocator {
  dependencies: Dependencies;

  constructor() {
    this.dependencies = {};
  }

  // TODO Make two functions, get / getMany
  get = (
    keyOrKeys: DEPENDENCY
  ): Dependencies[keyof Dependencies] | Dependencies[keyof Dependencies][] => {
    if (Array.isArray(keyOrKeys)) return keyOrKeys.map(key => this.get(key));

    const dependency: Dependencies[keyof Dependencies] = this.dependencies[keyOrKeys];

    return dependency;
  };

  register = (key: DEPENDENCY, dependency: Dependencies[keyof Dependencies]) => {
    this.dependencies[key] = dependency;
    return true;
  };

  deleteAll = () => {
    if (__DEV__) {
      Object.keys(this.dependencies).forEach(key => {
        this.dependencies[key] = null;
      });
    } else {
      throw new Error();
    }
  };
}

export default new DependencyLocator();
