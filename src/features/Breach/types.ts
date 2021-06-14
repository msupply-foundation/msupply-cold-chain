import { TemperatureBreach } from '~common/services/Database';

export interface AcknowledgeBreachSliceState {
  acknowledgingSensorId: string;
  acknowledging: boolean;
  updating: boolean;
  fetching: boolean;
  unacknowledged: TemperatureBreach[];
}

export interface FetchUnacknowledgedSuccessPayload {
  breaches: TemperatureBreach[];
}

export interface SensorIDPayload {
  sensorId: string;
}
