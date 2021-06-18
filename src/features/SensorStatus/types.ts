export interface FetchPayload {
  sensorId: string;
}

export interface FetchSuccessPayload {
  sensorId: string;
  status: SensorStatus;
}

export interface FetchFailPayload {
  sensorId: string;
}

export interface SensorStatus {
  id: string;
  mostRecentLogTimestamp: number;
  firstTimestamp: number;
  numberOfLogs: number;
  currentTemperature: number;
  isInHotBreach: boolean;
  isInColdBreach: boolean;
  hasHotBreach: boolean;
  hasColdBreach: boolean;
  isLowBattery: boolean;
  hasLogs: boolean;
}

export interface SensorStatusSliceState {
  fetchingById: Record<string, boolean>;
  byId: Record<string, SensorStatus>;
}

export enum BatteryLevelThreshold {
  Empty = 15,
  Low = 40,
  Medium = 65,
  High = 90,
}
