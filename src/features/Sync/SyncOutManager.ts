import axios from 'axios';
import { ENTITIES } from '~constants';
import { TemperatureLog } from '~services/Database/entities';
import { Sensor, TemperatureBreach } from '~common/services/Database/entities';
import { Syncable } from '~features/Sync/SyncQueueManager';

const mapBreaches = (breaches: TemperatureBreach[]): TemperatureBreachSyncOut[] => {
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

type SyncableDataTypes = 'TemperatureLog' | 'TemperatureBreach' | 'Sensor';

type TemperatureLogSyncOut = TemperatureLog;
type SensorSyncOut = Sensor;
type TemperatureBreachSyncOut = {
  type: string;
  thresholdMinimumTemperature: number;
  thresholdMaximumTemperature: number;
  thresholdDuration: number;
  id: string;
  sensorId: string;
  startTimestamp: number;
  acknowledged: boolean;
  endTimestamp?: number;
};

type SyncOut = TemperatureLogSyncOut | SensorSyncOut | TemperatureBreachSyncOut;

const mapInternalDataTypeToSyncable = (type: SyncableDataTypes, records: Syncable[]): SyncOut[] => {
  switch (type) {
    case 'TemperatureLog':
      return records as TemperatureLogSyncOut[];
    case 'TemperatureBreach':
      return mapBreaches(records as TemperatureBreach[]) as TemperatureBreachSyncOut[];
    case 'Sensor':
      return records as Sensor[];
  }
};

class SyncOutManager {
  private getAuthenticationBody = (username: string, password: string): string =>
    JSON.stringify({ username, password });

  private getSyncBody = (logs: SyncOut[]): string => {
    return JSON.stringify(logs);
  };

  public login = async (loginUrl: string, username: string, password: string): Promise<void> =>
    axios.post(loginUrl, this.getAuthenticationBody(username, password), {
      withCredentials: true,
    });

  public syncSensors = async (sensorUrl: string, logs: Sensor[]): Promise<any> =>
    axios.put(sensorUrl, this.getSyncBody(mapInternalDataTypeToSyncable(ENTITIES.SENSOR, logs)), {
      withCredentials: true,
    });

  public syncTemperatureLogs = async (
    temperatureLogUrl: string,
    logs: TemperatureLog[]
  ): Promise<void> =>
    axios.put(
      temperatureLogUrl,
      this.getSyncBody(mapInternalDataTypeToSyncable(ENTITIES.TEMPERATURE_LOG, logs)),
      { withCredentials: true }
    );

  public syncTemperatureBreaches = async (
    temperatureBreachUrl: string,
    logs: TemperatureBreach[]
  ): Promise<void> =>
    axios.put(
      temperatureBreachUrl,
      this.getSyncBody(mapInternalDataTypeToSyncable(ENTITIES.TEMPERATURE_BREACH, logs)),
      {
        withCredentials: true,
      }
    );
}

export { SyncOutManager };
