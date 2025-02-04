import { LogLevel } from 'react-native-ble-plx';

export { UtilService } from './UtilService';

export function logLevelFromString(value?: string): LogLevel {
  switch (value) {
    case 'debug':
      return LogLevel.Debug;
    case 'info':
      return LogLevel.Info;
    case 'warn':
      return LogLevel.Warning;
    case 'error':
      return LogLevel.Error;
    default:
      return LogLevel.Info;
  }
}
