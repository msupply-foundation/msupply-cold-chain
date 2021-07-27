import { BTUtilService } from '../BTUtilService';

import { Buffer } from 'buffer';
import { BLUE_MAESTRO, BLUETOOTH } from '../index';
import { MacAddress } from '../types/common';
import {
  Characteristic,
  ScanOptions,
  ScanMode,
  BluetoothDevice,
  InfoLog,
  MonitorCharacteristicCallback,
  MonitorCharacteristicParser,
  ScanCallback,
  SensorLog,
  LogLevel,
} from './types';
import { BluetoothManager } from './BleManager';

export class BleService {
  manager: BluetoothManager;
  utils: BTUtilService;

  constructor(manager: BluetoothManager, utils: BTUtilService) {
    this.manager = manager;
    manager.setLogLevel(LogLevel.Verbose);
    // In the future we may want to use our own utils,
    //  not the ones passed in from the app.
    //this.utils = new BTUtilService();
    this.utils = utils;
  }

  connectToDevice = async (macAddress: MacAddress): Promise<BluetoothDevice> => {
    return this.manager.connectToDevice(macAddress);
  };

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
    console.log('Started scan');
    this.manager.logLevel().then(value => console.log(`Log Level ${value}`));
  };

  writeCharacteristic = async (
    macAddress: MacAddress,
    command: string
  ): Promise<Characteristic> => {
    return this.manager.writeCharacteristicWithoutResponseForDevice(
      macAddress,
      BLUETOOTH.UART_SERVICE_UUID,
      BLUETOOTH.READ_CHARACTERISTIC_UUID,
      this.utils.base64FromString(command)
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
      const buffer = Buffer.concat(data.slice(1).map(datum => this.utils.bufferFromBase64(datum)));

      const ind = buffer.findIndex(
        (_, i) =>
          (i % 2 === 0 && buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_A) ||
          buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_B
      );

      return (buffer.slice(0, ind) as Buffer).reduce((acc: SensorLog[], _, index) => {
        if (index % 2 !== 0) return acc;
        return [
          ...acc,
          {
            temperature: buffer.readInt16BE(index) / BLUE_MAESTRO.TEMPERATURE_DIVISOR,
          },
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
    const result = await this.writeWithSingleResponse(
      macAddress,
      `${BLUE_MAESTRO.COMMANDS.UPDATE_LOG_INTERVAL}${logInterval}`,
      data => !!this.utils.stringFromBase64(data).match(/interval/i)
    );
    return !!result;
  };

  blink = async (macAddress: MacAddress): Promise<boolean> => {
    await this.connectAndDiscoverServices(macAddress);

    const result = (await this.writeWithSingleResponse(
      macAddress,
      BLUE_MAESTRO.COMMANDS.BLINK,
      data => {
        return !!this.utils.stringFromBase64(data).match(/ok/i);
      }
    )) as boolean;

    return result;
  };

  getInfo = async (macAddress: MacAddress): Promise<InfoLog> => {
    await this.connectAndDiscoverServices(macAddress);

    const monitorResultCallback: MonitorCharacteristicParser<string[], InfoLog> = data => {
      const parsedBase64 = data.map(this.utils.stringFromBase64);
      const defaultInfoLog: InfoLog = { batteryLevel: null, isDisabled: true };

      const parsedBatteryLevel = (info: string): number | null => {
        const batteryLevelStringOrNull = info.match(/Batt lvl: [0-9]{1,3}/);

        if (!batteryLevelStringOrNull) return batteryLevelStringOrNull;

        const batteryLevel = Number(batteryLevelStringOrNull[0].match(/[0-9]{1,3}/));

        return Number.isNaN(batteryLevel)
          ? null
          : this.utils.normaliseNumber(batteryLevel, [70, 100]);
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
        return !!this.utils.stringFromBase64(data).match(/ok/i);
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
