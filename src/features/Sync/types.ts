import { SyncSettingMap } from '~features/Entities/Setting';
import { TemperatureLog } from '~services/Database/entities';
import { Sensor, TemperatureBreach } from '~common/services/Database/entities';

export type SyncResponse = {
  invalid: string[];
  valid: string[];
};

// The validation rules on mSupply for records is here: https://github.com/sussol/msupply/blob/master/Project/Sources/Methods/coldchain_bodyV1Validation.4dm
export type SyncOut = TemperatureLogSyncOut | SensorSyncOut | TemperatureBreachSyncOut;

export type SyncableDataTypes = 'TemperatureLog' | 'TemperatureBreach' | 'Sensor';

export type Syncable = Sensor | TemperatureLog | TemperatureBreach;

export type TemperatureLogSyncOut = Pick<
  TemperatureLog,
  'id' | 'logInterval' | 'sensorId' | 'temperatureBreachId' | 'timestamp' | 'temperature'
>;

export type SensorSyncOut = Pick<
  Sensor,
  | 'id'
  | 'batteryLevel'
  | 'logInterval'
  | 'macAddress'
  | 'programmedDate'
  | 'logDelay'
  | 'isActive'
  | 'name'
>;

export type TemperatureBreachSyncOut = Pick<
  TemperatureBreach,
  'id' | 'acknowledged' | 'sensorId' | 'startTimestamp'
> & {
  endTimestamp?: number;
  type: string;
  thresholdMinimumTemperature: number;
  thresholdMaximumTemperature: number;
  thresholdDuration: number;
};

export interface SyncSliceStateShape {
  isSyncing: boolean;
  syncQueueLength: number;
}

export interface UpdateIsSyncingActionPayload {
  isSyncing: boolean;
}

export interface AuthenticateActionPayload {
  loginUrl: string;
  username: string;
  password: string;
}

export interface SyncSensorsActionPayload {
  sensorUrl: string;
}

export interface SyncSensorsSuccessActionPayload {
  syncLogs: Sensor[];
}

export interface SyncTemperatureLogsActionPayload {
  temperatureLogUrl: string;
}

export interface SyncSuccessPayload {
  numberSent: number;
}

export interface SyncTemperatureBreachesActionPayload {
  temperatureBreachUrl: string;
}

export interface SyncTemperatureBreachesSuccessActionPayload {
  syncLogs: TemperatureBreach[];
}

export interface FetchAllSuccessActionPayload {
  loginUrl: string;
  sensorUrl: string;
  temperatureLogUrl: string;
  temperatureBreachUrl: string;
  username: string;
  password: string;
  lastSync: number;
  isPassiveSyncEnabled: boolean;
}

export type SyncAllPayload = Omit<
  SyncSettingMap,
  'lastSync' | 'isPassiveSyncEnabled' | 'isIntegrating'
>;

export interface SyncingErrorActionPayload {
  error: string;
}

export interface CountSyncQueuePayload {
  count: number;
}
