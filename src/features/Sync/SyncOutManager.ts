import axios from 'axios';

const mapBreaches = (breaches: any[]) => {
  return breaches.map((breach: any) => {
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

    const mapped = {
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

class SyncOutManager {
  private getAuthenticationBody = (username: string, password: string): string =>
    JSON.stringify({ username, password });

  private getSyncBody = (logs: any[]): string => {
    return JSON.stringify(logs);
  };

  public login = async (loginUrl: string, username: string, password: string): Promise<void> =>
    axios.post(loginUrl, this.getAuthenticationBody(username, password), {
      withCredentials: true,
    });

  public syncSensors = async (sensorUrl: string, logs: any[]): Promise<any> =>
    axios.put(sensorUrl, this.getSyncBody(logs), { withCredentials: true });

  public syncTemperatureLogs = async (temperatureLogUrl: string, logs: any[]): Promise<void> =>
    axios.put(temperatureLogUrl, this.getSyncBody(logs), { withCredentials: true });

  public syncTemperatureBreaches = async (
    temperatureBreachUrl: string,
    logs: any[]
  ): Promise<void> =>
    axios.put(temperatureBreachUrl, this.getSyncBody(mapBreaches(logs)), { withCredentials: true });
}

export { SyncOutManager };
