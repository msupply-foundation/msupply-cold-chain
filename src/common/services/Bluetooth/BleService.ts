import {
  Subscription,
  Characteristic,
  BleError,
  BleManager,
  Device,
  ScanOptions,
  ScanMode,
} from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { BLUE_MAESTRO, BLUETOOTH } from '~constants';
import { MacAddress } from '~common/types/common';

export interface BluetoothDevice {
  id: string;
}

const normaliseBatteryLevel = (batteryLevel: number): number => {
  const oldMax = 100;
  const oldMin = 75;

  const newMax = 100;
  const newMin = 0;

  const oldRange = oldMax - oldMin;
  const newRange = newMax - newMin;

  const newVal = ((batteryLevel - oldMin) * newRange) / oldRange + newMin;

  return newVal;
};

const bufferFromBase64 = (base64: string): Buffer => Buffer.from(base64, 'base64');
const stringFromBase64 = (base64: string): string => bufferFromBase64(base64).toString('utf-8');
const base64FromString = (string: string): string =>
  Buffer.from(string, 'utf-8').toString('base64');

export interface BluetoothManager {
  connectToDevice(macAddress: MacAddress): Promise<BluetoothDevice>;
  isDeviceConnected(macAddress: MacAddress): Promise<boolean>;
  cancelDeviceConnection(macAddress: MacAddress): Promise<BluetoothDevice>;
  discoverAllServicesAndCharacteristicsForDevice(macAddress: MacAddress): Promise<BluetoothDevice>;
  stopDeviceScan(): void;
  startDeviceScan(
    UUIDs: string[] | null,
    options: ScanOptions | null,
    listener: (error: BleError | null, scannedDevice: Device | null) => void
  ): void;
  writeCharacteristicWithoutResponseForDevice(
    deviceIdentifier: string,
    serviceUUID: string,
    characteristicUUID: string,
    base64Value: string,
    transactionId?: string
  ): Promise<Characteristic>;
  monitorCharacteristicForDevice(
    deviceIdentifier: string,
    serviceUUID: string,
    characteristicUUID: string,
    listener: (error: BleError | null, characteristic: Characteristic | null) => void,
    transactionId?: string
  ): Subscription;
}

export interface InfoLog {
  batteryLevel: null | number;
  isDisabled: boolean;
}

export interface SensorLog {
  temperature: number;
}

interface ScanCallback {
  (error: BleError | null, device: Device | null): void;
}

interface Resolver<ResolverResult> {
  (result: ResolverResult): void;
}

interface ErrorRejector {
  (error: Error): void;
}

interface MonitorCharacteristicCallback<ResolverResult> {
  (
    result: Characteristic | null,
    resolver: Resolver<ResolverResult>,
    rejector: ErrorRejector
  ): void;
}

interface MonitorCharacteristicParser<ParserInput, ParserResult> {
  (result: ParserInput): ParserResult;
}

export class BleService {
  manager: BluetoothManager;

  constructor(manager = new BleManager() as BluetoothManager) {
    this.manager = manager;
  }

  async connectToDevice(macAddress: MacAddress): Promise<BluetoothDevice> {
    return this.manager.connectToDevice(macAddress);
  }

  connectAndDiscoverServices = async (macAddress: MacAddress): Promise<BluetoothDevice> => {
    if (await this.manager.isDeviceConnected(macAddress)) {
      await this.manager.cancelDeviceConnection(macAddress);
    }

    const device = await this.connectToDevice(macAddress);
    await this.manager.discoverAllServicesAndCharacteristicsForDevice(macAddress);

    return device;
  };

  stopScan = (): void => {
    this.manager.stopDeviceScan();
  };

  scanForSensors = (callback: ScanCallback): void => {
    const scanOptions: ScanOptions = { scanMode: ScanMode.LowLatency };
    this.manager.startDeviceScan(null, scanOptions, callback);
  };

  writeCharacteristic = async (
    macAddress: MacAddress,
    command: string
  ): Promise<Characteristic> => {
    return this.manager.writeCharacteristicWithoutResponseForDevice(
      macAddress,
      BLUETOOTH.UART_SERVICE_UUID,
      BLUETOOTH.READ_CHARACTERISTIC_UUID,
      base64FromString(command)
    );
  };

  monitorCharacteristic = (
    macAddress: MacAddress,
    callback: MonitorCharacteristicCallback<boolean | SensorLog[] | InfoLog>
  ): Promise<boolean | SensorLog[] | InfoLog> => {
    return new Promise((resolve, reject) => {
      this.manager.monitorCharacteristicForDevice(
        macAddress,
        BLUETOOTH.UART_SERVICE_UUID,
        BLUETOOTH.WRITE_CHARACTERISTIC_UUID,
        (_, result) => {
          callback(result, resolve, reject);
        }
      );
    });
  };

  writeAndMonitor = async (
    macAddress: MacAddress,
    command: string,
    parser: MonitorCharacteristicParser<string[], SensorLog[] | InfoLog>
  ): Promise<boolean | InfoLog | SensorLog[]> => {
    const data: string[] = [];

    const monitoringCallback: MonitorCharacteristicCallback<SensorLog[] | InfoLog> = (
      result,
      resolve,
      reject
    ) => {
      if (result?.value) data.push(result.value);
      else {
        try {
          resolve(parser(data));
        } catch (e) {
          reject(new Error(`Parsing failed: ${e.message}`));
        }
      }
    };

    const monitor = this.monitorCharacteristic(macAddress, monitoringCallback);
    await this.writeCharacteristic(macAddress, command);

    return monitor;
  };

  writeWithSingleResponse = async (
    macAddress: MacAddress,
    command: string,
    parser: MonitorCharacteristicParser<string, boolean>
  ): Promise<boolean | InfoLog | SensorLog[]> => {
    const monitorCharacteristicCallback: MonitorCharacteristicCallback<boolean> = (
      result,
      resolve,
      reject
    ) => {
      if (result?.value) {
        try {
          resolve(parser(result.value));
        } catch (e) {
          reject(new Error(`Parsing failed: ${e.message}`));
        }
      } else reject(new Error(`Command Failed`));
    };

    const monitor = this.monitorCharacteristic(macAddress, monitorCharacteristicCallback);
    await this.writeCharacteristic(macAddress, command);

    return monitor;
  };

  downloadLogs = async (macAddress: MacAddress): Promise<SensorLog[]> => {
    await this.connectAndDiscoverServices(macAddress);

    const monitorCallback: MonitorCharacteristicParser<string[], SensorLog[]> = (
      data: string[]
    ) => {
      const buffer = Buffer.concat(data.slice(1).map(datum => bufferFromBase64(datum)));

      const ind = buffer.findIndex(
        (_, i) =>
          (i % 2 === 0 && buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_A) ||
          buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_B
      );

      return (buffer.slice(0, ind) as Buffer).reduce((acc: SensorLog[], _, index) => {
        if (index % 2 !== 0) return acc;
        return [
          ...acc,
          { temperature: buffer.readInt16BE(index) / BLUE_MAESTRO.TEMPERATURE_DIVISOR },
        ];
      }, []);
    };

    const result = (await this.writeAndMonitor(
      macAddress,
      BLUE_MAESTRO.COMMANDS.DOWNLOAD,
      monitorCallback
    )) as SensorLog[];

    return result;
  };

  updateLogInterval = async (macAddress: MacAddress, logInterval: number): Promise<boolean> => {
    await this.connectAndDiscoverServices(macAddress);
    const result = (await this.writeWithSingleResponse(
      macAddress,
      `${BLUE_MAESTRO.COMMANDS.UPDATE_LOG_INTERVAL}${logInterval}`,
      data => !!stringFromBase64(data).match(/interval/i)
    )) as boolean;
    return result;
  };

  blink = async (macAddress: MacAddress): Promise<boolean> => {
    await this.connectAndDiscoverServices(macAddress);

    const result = (await this.writeWithSingleResponse(
      macAddress,
      BLUE_MAESTRO.COMMANDS.BLINK,
      data => {
        return !!stringFromBase64(data).match(/ok/i);
      }
    )) as boolean;

    return result;
  };

  getInfo = async (macAddress: MacAddress): Promise<InfoLog> => {
    await this.connectAndDiscoverServices(macAddress);

    const monitorResultCallback: MonitorCharacteristicParser<string[], InfoLog> = data => {
      const parsedBase64 = data.map(stringFromBase64);
      const defaultInfoLog: InfoLog = { batteryLevel: null, isDisabled: true };

      const parsedBatteryLevel = (info: string): number | null => {
        const batteryLevelStringOrNull = info.match(/Batt lvl: [0-9]{1,3}/);

        if (!batteryLevelStringOrNull) return batteryLevelStringOrNull;

        const batteryLevel = Number(batteryLevelStringOrNull[0].match(/[0-9]{1,3}/));

        return Number.isNaN(batteryLevel) ? null : normaliseBatteryLevel(batteryLevel);
      };

      const parsedIsDisabled = (info: string): boolean => !!info.match(/Btn on\/off: 1/);

      return parsedBase64.reduce((acc, info) => {
        const isDisabled = parsedIsDisabled(info);
        const batteryLevel = parsedBatteryLevel(info);

        if (isDisabled) return { ...acc, isDisabled };
        if (batteryLevel) return { ...acc, batteryLevel };

        return acc;
      }, defaultInfoLog);
    };

    const result: InfoLog = (await this.writeAndMonitor(
      macAddress,
      BLUE_MAESTRO.COMMANDS.INFO,
      monitorResultCallback
    )) as InfoLog;

    return result;
  };

  toggleButton = async (macAddress: MacAddress): Promise<boolean> => {
    await this.connectAndDiscoverServices(macAddress);
    const result = (await this.writeWithSingleResponse(
      macAddress,
      BLUE_MAESTRO.COMMANDS.DISABLE_BUTTON,
      data => {
        return !!stringFromBase64(data).match(/ok/i);
      }
    )) as boolean;
    return result;
  };

  getInfoWithRetries = async (
    macAddress: MacAddress,
    retriesLeft: number,
    error: Error | null
  ): Promise<InfoLog> => {
    if (!retriesLeft) throw error;

    return this.getInfo(macAddress).catch(err =>
      this.getInfoWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  toggleButtonWithRetries = async (
    macAddress: MacAddress,
    retriesLeft: number,
    error: Error | null
  ): Promise<boolean> => {
    if (!retriesLeft) throw error;

    return this.toggleButton(macAddress).catch(err =>
      this.toggleButtonWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  downloadLogsWithRetries = async (
    macAddress: MacAddress,
    retriesLeft: number,
    error: Error | null
  ): Promise<SensorLog[]> => {
    if (!retriesLeft) throw error;

    return this.downloadLogs(macAddress).catch(err =>
      this.downloadLogsWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  blinkWithRetries = async (
    macAddress: MacAddress,
    retriesLeft: number,
    error: Error | null
  ): Promise<boolean> => {
    if (!retriesLeft) throw error;

    return this.blink(macAddress).catch(err =>
      this.blinkWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  updateLogIntervalWithRetries = async (
    macAddress: MacAddress,
    logInterval: number,
    retriesLeft: number,
    error: Error | null
  ): Promise<boolean> => {
    if (!retriesLeft) throw error;

    return this.updateLogInterval(macAddress, logInterval).catch(err =>
      this.updateLogIntervalWithRetries(macAddress, logInterval, retriesLeft - 1, err)
    );
  };
}
