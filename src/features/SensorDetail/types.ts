import {
  CumulativeBreach,
  CumulativeBreachLookup,
} from '~features/Breach/CumulativeBreach/CumulativeBreachManager';

export interface DetailSliceState {
  sensorId: string;
  from: number;
  to: number;
  possibleFrom: number;
  possibleTo: number;
  isLoading: boolean;
  minFrom: number;
  maxTo: number;
}

export interface UpdateDateRangePayload {
  sensorId: string;
  from: number;
  to: number;
}

export interface UpdateDataPayload {
  sensorId: string;
  from: number;
  to: number;
}

export interface DetailInitPayload {
  sensorId: string;
  minFrom: number;
  maxTo: number;
}

export interface DetailInitSuccessPayload {
  sensorId: string;
  from: number;
  to: number;
  possibleFrom: number;
  possibleTo: number;
}

export interface DetailCumulativeBreachSliceState {
  hot: CumulativeBreach | null;
  cold: CumulativeBreach | null;
  isLoading: boolean;
}

export interface FetchCumulativesSuccess {
  cumulatives: CumulativeBreachLookup;
  sensorId: string;
}
