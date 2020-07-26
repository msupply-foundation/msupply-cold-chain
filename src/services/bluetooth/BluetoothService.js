import { NativeModules } from 'react-native';

const DEFAULT_MANAGER = NativeModules.BleManager;
const DEFAULT_CONFIG = { manufacturerId: 307 };

export class BluetoothService {
  constructor(manager = DEFAULT_MANAGER, config = DEFAULT_CONFIG) {
    this.manager = manager;
    this.config = config;
  }

  get manufacturerId() {
    return this.config.manufacturerId;
  }

  scanForDevices = async () => {
    const { success, data, error } = await this.manager.getDevices(this.manufacturerId);

    if (success) return data;
    throw error;
  };

  sendCommand = async (macAddress, command) => {
    return this.manager.sendCommand(this.manufacturerId, macAddress, command);
  };

  blinkSensor = async macAddress => {
    const { success, error } = await this.sendCommand(macAddress, '*blink');

    if (success) return success;
    throw error;
  };

  downloadLogs = async macAddress => {
    const { success, data, error } = await this.sendCommand(macAddress, '*logall');

    const logs = data?.[0]?.logs;
    if (success && logs) return logs;
    if (!success) throw error;
    throw new Error();
  };

  setLogInterval = async (macAddress, interval = 300) => {
    const command = `*lint${interval}`;
    const result = await this.sendCommand(macAddress, command);
    const { success, error } = result;

    if (success) return success;
    throw error;
  };

  setAdvertisementInterval = async (macAddress, interval = 300) => {
    const command = `*sadv${interval}`;
    const result = await this.sendCommand(macAddress, command);
    const { success, error } = result;

    if (success) return success;
    throw error;
  };
}
