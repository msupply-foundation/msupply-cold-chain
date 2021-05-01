import axios from 'axios';

import { SyncLog } from '../../common/services/Database/entities';

class SyncOutManager {
  private getAuthenticationBody = (username: string, password: string): string =>
    JSON.stringify({ username, password });

  private getSyncBody = (logs: SyncLog[]): string =>
    JSON.stringify(logs.map(log => JSON.parse(log.payload)));

  public login = async (loginUrl: string, username: string, password: string): Promise<void> => {
    axios.post(loginUrl, this.getAuthenticationBody(username, password), { withCredentials: true });
  };

  public syncSensors = async (sensorUrl: string, logs: SyncLog[]): Promise<void> => {
    axios.put(sensorUrl, this.getSyncBody(logs), { withCredentials: true });
  };

  public syncTemperatureLogs = async (
    temperatureLogUrl: string,
    logs: SyncLog[]
  ): Promise<void> => {
    axios.put(temperatureLogUrl, this.getSyncBody(logs), { withCredentials: true });
  };

  public syncTemperatureBreaches = async (
    temperatureBreachUrl: string,
    logs: SyncLog[]
  ): Promise<void> => {
    axios.put(temperatureBreachUrl, this.getSyncBody(logs), { withCredentials: true });
  };
}

export { SyncOutManager };
