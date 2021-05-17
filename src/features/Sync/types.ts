import { SyncSettingMap } from '~features/Entities/Setting';
import { TemperatureLog } from '~services/Database/entities';
import { Sensor, TemperatureBreach } from '~common/services/Database/entities';

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

export interface SyncTemperatureLogsSuccessActionPayload {
  syncLogs: TemperatureLog[];
}

export interface SyncTemperatureBreachesActionPayload {
  temperatureBreachUrl: string;
}

export interface SyncTemperatureBreachesSuccessActionPayload {
  syncLogs: TemperatureBreach[];
}

export interface FailurePayload {
  errorMessage: string;
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
export interface PrepareActionReturn<SomePayload> {
  payload: SomePayload;
}
