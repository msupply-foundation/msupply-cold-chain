export interface ChartSliceState {
  listLoadingById: Record<string, boolean>;
  listDataById: Record<string, ChartDataPoint[]>;
  detailDataPoints: ChartDataPoint[];
}

export interface ChartDataPoint {
  temperature: number;
  timestamp: number;
}

export interface ChartTimestamp {
  from?: number;
  to?: number;
}

export interface FailurePayload {
  errorMessage: string;
}

export interface GetListChartDataPayload {
  sensorId: string;
}

export interface GetDetailChartDataPayload {
  from: number;
  to: number;
  sensorId: string;
}

export interface GetListChartDataFailedPayload {
  sensorId: string;
}

export interface GetChartDataSuccessfulPayload {
  sensorId: string;
  data: ChartDataPoint[];
}

export type ListDataById = Record<string, ChartDataPoint[]>;
