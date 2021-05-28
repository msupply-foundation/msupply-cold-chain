export type ReportHeader =
  | SensorStatsReportKey[]
  | TemperatureLogsReportKey[]
  | SensorReportKey[]
  | BreachReportKey[]
  | GeneralReportKey[]
  | BreachConfigReportKey[];

export type ReportData =
  | SensorStatsReportShape
  | TemperatureLogsReportShape
  | SensorReportShape
  | BreachReportShape
  | GeneralReportShape
  | BreachConfigReportShape;

export enum SensorStatsReportKey {
  MaxTemperature = 'Max Temperature',
  MinTemperature = 'Min Temperature',
  NumberOfCumulativeBreaches = 'Number of cumulative breaches',
  NumberOfContinuousBreaches = 'Number of continuous breaches',
}

export type SensorStatsReportShape = {
  [SensorStatsReportKey.MaxTemperature]: number;
  [SensorStatsReportKey.MinTemperature]: number;
  [SensorStatsReportKey.NumberOfContinuousBreaches]: number;
  [SensorStatsReportKey.NumberOfCumulativeBreaches]: number;
};

export enum TemperatureLogsReportKey {
  IsCumulativeBreach = 'Is cumulative breach',
  Timestamp = 'Timestamp',
  Temperature = 'Temperature',
  LoggingInterval = 'Logging Interval (Minutes)',
  IsContinuousBreach = 'Is continuous breach',
}

export type TemperatureLogsReportShape = {
  [TemperatureLogsReportKey.IsCumulativeBreach]: 'Hot' | 'Cold' | 'x';
  [TemperatureLogsReportKey.Timestamp]: number;
  [TemperatureLogsReportKey.Temperature]: number;
  [TemperatureLogsReportKey.LoggingInterval]: number;
  [TemperatureLogsReportKey.IsContinuousBreach]: 'Hot' | 'Cold' | '';
};

export enum SensorReportKey {
  ProgrammedOn = 'Programmed On',
  LoggingStart = 'Logging Start',
  LoggingInterval = 'Logging Interval',
}

export type SensorReportShape = {
  [SensorReportKey.ProgrammedOn]: string;
  [SensorReportKey.LoggingStart]: string;
  [SensorReportKey.LoggingInterval]: number;
};

export enum BreachReportKey {
  BreachType = 'Breach Type',
  BreachName = 'Breach Name',
  StartDate = 'Start date',
  EndDate = 'End date',
  ExposureDuration = 'Exposure Duration (minutes)',
  MaxTemperature = 'Max Temp',
  MinTemperature = 'Min Temp',
}

export type BreachReportShape = {
  [BreachReportKey.BreachType]: 'Continuous';
  [BreachReportKey.BreachName]: string;
  [BreachReportKey.StartDate]: string;
  [BreachReportKey.EndDate]: string;
  [BreachReportKey.ExposureDuration]: number;
  [BreachReportKey.MaxTemperature]: number;
  [BreachReportKey.MinTemperature]: number;
};

export enum BreachConfigReportKey {
  BreachName = 'Breach Name',
  NumberOfMinutes = 'Number of Minutes',
  BreachType = 'Breach Type',
  Temperature = 'Temperature',
  Direction = 'Direction',
}

export type BreachConfigReportShape = {
  [BreachConfigReportKey.BreachName]: string;
  [BreachConfigReportKey.NumberOfMinutes]: number;
  [BreachConfigReportKey.BreachType]: 'Continuous' | 'Cumulative';
  [BreachConfigReportKey.Temperature]: number;
  [BreachConfigReportKey.Direction]: 'Max' | 'Min';
};

export enum GeneralReportKey {
  'Timezone' = 'Timezone',
  'Device' = 'Device',
  'SensorName' = 'Sensor Name',
  'ExportedBy' = 'Exported By',
  'JobDescription' = 'Job description',
}

export type GeneralReportShape = {
  [GeneralReportKey.Timezone]: string;
  [GeneralReportKey.Device]: string;
  [GeneralReportKey.SensorName]: string;
  [GeneralReportKey.ExportedBy]: string;
  [GeneralReportKey.JobDescription]: string;
};
