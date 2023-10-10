import Axios, { AxiosResponse } from 'axios';
import _ from 'lodash';
import { TemperatureLog } from '~services/Database/entities';
import { Sensor, TemperatureBreach } from '~common/services/Database/entities';

import {
  SensorSyncOut,
  SyncOut,
  SyncResponse,
  TemperatureBreachSyncOut,
  TemperatureLogSyncOut,
} from '~features/Sync/types';

class SyncOutManager {
  axios: typeof Axios;

  constructor(axios = Axios) {
    this.axios = axios;
  }

  getAuthenticationBody = (username: string, password: string): string =>
    JSON.stringify({ username, password });

  getSyncBody = (logs: SyncOut[]): string => {
    return JSON.stringify(logs);
  };

  mapSensors = (sensors: Sensor[]): SensorSyncOut[] => {
    return sensors.map((sensor: Sensor) => {
      const {
        id,
        logInterval,
        name,
        macAddress,
        batteryLevel,
        logDelay,
        programmedDate,
        isActive,
      } = sensor;

      return {
        id,
        logInterval,
        name,
        macAddress,
        batteryLevel,
        logDelay,
        programmedDate,
        isActive,
      };
    });
  };

  mapTemperatureLogs = (temperatureLogs: TemperatureLog[]): TemperatureLogSyncOut[] => {
    return temperatureLogs.map((log: TemperatureLog) => {
      const { id, logInterval, sensorId, temperatureBreachId, timestamp, temperature } = log;
      return { id, logInterval, sensorId, temperatureBreachId, timestamp, temperature };
    });
  };

  mapBreaches = (breaches: TemperatureBreach[]): TemperatureBreachSyncOut[] => {
    return breaches.map((breach: TemperatureBreach) => {
      const {
        id,
        temperatureBreachConfiguration,
        sensorId,
        startTimestamp,
        endTimestamp,
        acknowledged,
      } = breach;

      const {
        minimumTemperature,
        maximumTemperature,
        duration,
        id: configId,
      } = temperatureBreachConfiguration;

      const type = configId.includes('HOT') ? 'HOT_CONSECUTIVE' : 'COLD_CONSECUTIVE';
      const thresholdMinimumTemperature = minimumTemperature;
      const thresholdMaximumTemperature = maximumTemperature;
      const thresholdDuration = duration;

      const mapped: TemperatureBreachSyncOut = {
        type,
        thresholdMinimumTemperature,
        thresholdMaximumTemperature,
        thresholdDuration,
        id,
        sensorId,
        startTimestamp,
        acknowledged,
      };

      if (endTimestamp != null) {
        mapped.endTimestamp = endTimestamp;
      }

      return mapped;
    });
  };

  put = async (url: string, data: string): Promise<AxiosResponse<SyncResponse>> =>
    this.axios.put<SyncResponse>(url, data, { withCredentials: true });

  public login = async (
    loginUrl: string,
    username: string,
    password: string
  ): Promise<AxiosResponse<''>> =>
    this.axios.post(loginUrl, this.getAuthenticationBody(username, password), {
      withCredentials: true,
    });

  public syncSensors = async (
    sensorUrl: string,
    logs: Sensor[]
  ): Promise<AxiosResponse<SyncResponse>> =>
    this.put(sensorUrl, this.getSyncBody(this.mapSensors(logs)));

  public syncTemperatureLogs = async (
    temperatureLogUrl: string,
    logs: TemperatureLog[]
  ): Promise<AxiosResponse<SyncResponse>[]> => {
    const numberOfChunks = Math.ceil(logs.length / 20);
    const chunkSize = logs.length / numberOfChunks;
    const chunked = _.chunk(logs, chunkSize);

    const results: AxiosResponse<SyncResponse>[] = await Promise.all(
      chunked.map(chunk =>
        this.put(temperatureLogUrl, this.getSyncBody(this.mapTemperatureLogs(chunk)))
      )
    );

    return results;
  };

  public syncTemperatureBreaches = async (
    temperatureBreachUrl: string,
    logs: TemperatureBreach[]
  ): Promise<AxiosResponse<SyncResponse>> =>
    this.put(temperatureBreachUrl, this.getSyncBody(this.mapBreaches(logs)));
}

export { SyncOutManager };
