import { BleManager } from './BleManager';
import { BLUETOOTH_SERVICE, BLUETOOTH_SERVICE_ERROR } from '~constants';

const DEFAULT_MANAGER = BleManager;
const DEFAULT_CONFIG = { manufacturerId: BLUETOOTH_SERVICE.DEFAULT_MANUFACTURER_ID };

export class BluetoothService {
  constructor(manager = DEFAULT_MANAGER, config = DEFAULT_CONFIG) {
    const { manufacturerId } = config;
    if (!manufacturerId || typeof manufacturerId !== 'number') {
      throw new Error(BLUETOOTH_SERVICE_ERROR.NO_MANUFACTURER_ID);
    }

    this.manager = manager;
    this.config = { ...config };
  }

  get manufacturerId() {
    return this.config.manufacturerId;
  }

  scanForDevices = async () => {
    if (!(this.manufacturerId && typeof this.manufacturerId === 'number')) {
      throw new Error(BLUETOOTH_SERVICE_ERROR.NO_MANUFACTURER_ID_SET);
    }

    const { success, data, error } = await this.manager.getDevices(this.manufacturerId, '');

    if (success) return data;
    throw error;
  };

  sendCommand = async (macAddress, command) => {
    if (!(macAddress && typeof macAddress === 'string')) {
      throw new Error(BLUETOOTH_SERVICE_ERROR.NO_MAC_ADDRESS);
    }

    if (!(command && typeof command === 'string')) {
      throw new Error(BLUETOOTH_SERVICE_ERROR.NO_COMMAND);
    }

    if (!(this.manufacturerId && typeof this.manufacturerId === 'number')) {
      throw new Error(BLUETOOTH_SERVICE_ERROR.NO_MANUFACTURER_ID_SET);
    }

    return this.manager.sendCommand(this.manufacturerId, macAddress, command);
  };

  blinkSensor = async macAddress => {
    const { success, error } = await this.sendCommand(macAddress, '*blink');

    if (success) return success;

    throw new Error(`${error?.code} - ${error?.message}`);
  };

  downloadLogs = async macAddress => {
    const { success, data, error } = await this.sendCommand(macAddress, '*logall');

    const logs = data?.[0]?.logs;
    if (success && logs) return logs;
    if (!success) throw new Error(`${error?.code} - ${error.message}`);

    throw new Error();
  };

  setLogInterval = async (macAddress, interval = BLUETOOTH_SERVICE.DEFAULT_INTERVAL) => {
    const intervalWithinBounds =
      interval > BLUETOOTH_SERVICE.MIN_INTERVAL && interval < BLUETOOTH_SERVICE.MAX_INTERVAL;
    if (!(typeof interval === 'number' && intervalWithinBounds)) {
      throw new Error(BLUETOOTH_SERVICE_ERROR.INVALID_LOGGING_INTERVAL);
    }

    const command = `*lint${interval}`;
    const result = await this.sendCommand(macAddress, command);
    const { success, error } = result;

    if (success) return success;

    throw new Error(`${error?.code} - ${error?.message}`);
  };

  setAdvertisementInterval = async (macAddress, interval = 300) => {
    const intervalWithinBounds =
      interval > BLUETOOTH_SERVICE.MIN_INTERVAL && interval < BLUETOOTH_SERVICE.MAX_INTERVAL;

    if (!(typeof interval === 'number' && intervalWithinBounds)) {
      throw new Error(BLUETOOTH_SERVICE_ERROR.INVALID_LOGGING_INTERVAL);
    }

    const command = `*sadv${interval}`;
    const result = await this.sendCommand(macAddress, command);
    const { success, error } = result;

    if (success) return success;

    throw new Error(`${error?.code} - ${error?.message}`);
  };
}
