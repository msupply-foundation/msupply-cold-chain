import { BTUtilService } from '../BTUtilService';

import { Buffer } from 'buffer';
import { BLUE_MAESTRO, BT510 } from '../index';
import { MacAddress } from '../types/common';
import {
  Characteristic,
  ScanOptions,
  ScanMode,
  TypedDevice,
  InfoLog,
  MonitorCharacteristicCallback,
  MonitorCharacteristicParser,
  ScanCallback,
  SensorLog,
  DataLog,
  LogLevel,
  Device,
  BleError,
} from './types';
import { BluetoothManager } from './BleManager';

export class BleService {
  manager: BluetoothManager;
  utils: BTUtilService;

  constructor(manager: BluetoothManager) {
    this.manager = manager;
    manager.setLogLevel(LogLevel.Verbose);
    // Caller passes in utils from the main app,
    // but we ignore it and use our own.
    // This needs to be fixed in the main app.
    this.utils = new BTUtilService();
  }

  connectToDevice = async (deviceId: string): Promise<void> => {
    await this.manager.connectToDevice(deviceId);
  };

  connectAndDiscoverServices = async (deviceDescriptor: string): Promise<TypedDevice> => {
    const device = this.utils.deviceDescriptorToDevice(deviceDescriptor);
    if (await this.manager.isDeviceConnected(device.id)) {
      await this.manager.cancelDeviceConnection(device.id);
    }
    await this.connectToDevice(device.id);

    await this.manager.discoverAllServicesAndCharacteristicsForDevice(device.id);
    return device;
  };

  stopScan = (): void => {
    this.manager.stopDeviceScan();
  };

  scanForSensors = (callback: ScanCallback): void => {
    const scanOptions: ScanOptions = { scanMode: ScanMode.LowLatency };
    const filteredCallback = (err: BleError | null, device: Device | null): void => {
      if (err) {
        console.log('BleService Scan Error:', JSON.stringify(err));
      }

      if (device?.manufacturerData) {
        const mfgId = Buffer.from(device.manufacturerData, 'base64').readInt16LE(0);
        if (mfgId === BLUE_MAESTRO.MANUFACTURER_ID || mfgId === BT510.MANUFACTURER_ID) {
          const descriptor = this.utils.deviceToDeviceDescriptor(device.id, mfgId);

          callback(err, descriptor);
        }
      }
    };
    this.manager.startDeviceScan(null, scanOptions, filteredCallback);
  };

  writeCharacteristic = async (device: TypedDevice, command: string): Promise<Characteristic> => {
    return this.manager.writeCharacteristicWithoutResponseForDevice(
      device.id,
      device.deviceType.BLUETOOTH_UART_SERVICE_UUID,
      device.deviceType.BLUETOOTH_READ_CHARACTERISTIC_UUID,
      this.utils.base64FromString(command)
    );
  };

  monitorCharacteristic = (
    device: TypedDevice,
    callback: MonitorCharacteristicCallback<boolean | SensorLog[] | InfoLog | DataLog>
  ): Promise<boolean | SensorLog[] | InfoLog | DataLog> => {
    return new Promise((resolve, reject) => {
      const subscription = this.manager.monitorCharacteristicForDevice(
        device.id,
        device.deviceType.BLUETOOTH_UART_SERVICE_UUID,
        device.deviceType.BLUETOOTH_WRITE_CHARACTERISTIC_UUID,
        (_, result) => {
          callback(result, resolve, reject, subscription);
        }
      );
    });
  };

  writeAndMonitor = async (
    device: TypedDevice,
    command: string,
    parser: MonitorCharacteristicParser<string[], SensorLog[] | InfoLog | DataLog>
  ): Promise<boolean | InfoLog | SensorLog[] | DataLog> => {
    const data: string[] = [];
    let done = 0;
    const alreadyDone = (): number => done++;

    const transmissionDone = (val: string): boolean => {
      const str = this.utils.stringFromBase64(val);
      const pattern = /.*}$/;
      const result = pattern.test(str);
      return result;
    };

    const monitoringCallback: MonitorCharacteristicCallback<SensorLog[] | InfoLog | DataLog> = (
      result,
      resolve,
      reject,
      subscription
    ) => {
      if (result?.value) {
        data.push(result.value);
        // return to wait for next chunk
        if (device.deviceType === BLUE_MAESTRO || !transmissionDone(result.value)) return;
      }
      try {
        subscription.remove();
        if (device.deviceType === BT510 && alreadyDone()) {
          // Don't call the parser more than once.
          // (Although it probably doesn't hurt anything,
          // since the Promise has already resolved and returned the result
          // to the caller)
          return;
        }
        resolve(parser(data));
      } catch (e) {
        reject(new Error(`Parsing failed: ${e.message}`));
      }
    };

    const monitor = this.monitorCharacteristic(device, monitoringCallback);
    await this.writeCharacteristic(device, command);

    return monitor;
  };

  writeWithSingleResponse = async (
    device: TypedDevice,
    command: string,
    parser: MonitorCharacteristicParser<string, boolean>
  ): Promise<boolean | SensorLog[] | InfoLog | DataLog> => {
    const monitorCharacteristicCallback: MonitorCharacteristicCallback<boolean> = (
      result,
      resolve,
      reject,
      subscription
    ) => {
      if (result?.value) {
        try {
          subscription?.remove();
          resolve(parser(result.value));
        } catch (e) {
          reject(new Error(`Parsing failed: ${e.message}`));
        }
      } else reject(new Error(`Command Failed`));
    };
    const monitor = this.monitorCharacteristic(device, monitorCharacteristicCallback);
    await this.writeCharacteristic(device, command);

    return monitor;
  };

  downloadLogs = async (macAddress: MacAddress): Promise<SensorLog[]> => {
    const device = await this.connectAndDiscoverServices(macAddress);

    const monitorCallback: MonitorCharacteristicParser<string[], SensorLog[] | DataLog> = (
      data: string[]
    ) => {
      if (device.deviceType === BLUE_MAESTRO) {
        const buffer = Buffer.concat(
          data.slice(1).map(datum => this.utils.bufferFromBase64(datum))
        );
        const ind = buffer.findIndex(
          (_, i) =>
            (i % 2 === 0 && buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_A) ||
            buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_B
        );

        return (buffer.slice(0, ind) as Buffer).reduce((acc: SensorLog[], _, index) => {
          if (index % 2 !== 0) return acc;
          return [
            ...acc,
            { time: '', temperature: buffer.readInt16BE(index) / BLUE_MAESTRO.TEMPERATURE_DIVISOR },
          ];
        }, []);
      } else {
        // BT510
        const buffer = Buffer.concat(data.map(datum => this.utils.bufferFromBase64(datum)));
        const result = JSON.parse(buffer.toString());
        const numEvents = Number(result.result[0] / 8);
        return { numEvents, data: result.result[1] };
      }
    }; // end monitor callback

    if (device.deviceType === BT510) {
      // const FIFO = '0';
      // const LIFO = '1';

      const prepareLogs = async (): Promise<boolean> => {
        const prepCommand = BT510.COMMAND_PREPARE_LOG.replace('MODE', '0');
        return (await this.writeWithSingleResponse(device, prepCommand, data => {
          const info = this.utils.stringFromBase64(data);
          const result = JSON.parse(info).result;
          return !!result;
        })) as boolean;
      };
      const ackLogs = async (numEvents: number): Promise<boolean> => {
        const ackCommand = BT510.COMMAND_ACK_LOG.replace('NUMEVENTS', numEvents.toString());
        return (await this.writeWithSingleResponse(device, ackCommand, data => {
          const info = this.utils.stringFromBase64(data);
          const result = !!(JSON.parse(info).result === numEvents);
          if (!result) throw new Error(`BleService ${info}`);
          return result;
        })) as boolean;
      };

      let sensorLog = [] as SensorLog[];

      while (await prepareLogs()) {
        const downloadCommand = BT510.COMMAND_DOWNLOAD.replace('NUMEVENTS', '500');
        const dataLog = (await this.writeAndMonitor(
          device,
          downloadCommand,
          monitorCallback
        )) as DataLog;
        const logBuffer = this.utils.bufferFromBase64(dataLog.data);
        const log = logBuffer.reduce((acc: SensorLog[], _, index) => {
          if (index % 8 !== 0) return acc;
          //const time = moment.unix(logBuffer.readInt32LE(index)).format('l HH:mm:ss');
          //const time = logBuffer.readInt32LE(index);
          const temperature =
            Math.round((logBuffer.readInt16LE(index + 4) / BT510.TEMPERATURE_DIVISOR) * 10) / 10;
          const eventType = logBuffer.readInt8(index + 6);
          //const salt = logBuffer.readInt8(index + 7);
          if (eventType === 1) {
            // temperature
            return [
              ...acc,
              {
                temperature,
                //                  eventType,
                //                  salt,
              },
            ];
          } else {
            return [...acc];
          }
        }, []);

        sensorLog = sensorLog.concat(log);
        try {
          await ackLogs(dataLog.numEvents);
        } catch (e) {}
      }
      // The table only shows up on flipper, and then
      // only the first 100 items are printed.
      return sensorLog;
    } else {
      const command = BLUE_MAESTRO.COMMAND_DOWNLOAD.replace('NUMEVENTS', '500');
      const result = (await this.writeAndMonitor(device, command, monitorCallback)) as SensorLog[];
      return result;
    }
  };

  updateLogInterval = async (macAddress: MacAddress, logInterval: number): Promise<boolean> => {
    const device = await this.connectAndDiscoverServices(macAddress);
    const command = device.deviceType.COMMAND_UPDATE_LOG_INTERVAL.replace(
      'INTERVAL',
      logInterval.toString()
    );
    const result = await this.writeWithSingleResponse(device, command, data => {
      const info = this.utils.stringFromBase64(data);
      return (
        (device.deviceType === BT510 && JSON.parse(info).result === 'ok') ||
        !!info.match(/interval/i)
      );
    });
    // Clear logs
    if (device.deviceType === BT510) {
      this.downloadLogs(macAddress);
    }
    return !!result;
  };

  blink = async (macAddress: MacAddress): Promise<boolean> => {
    const device = await this.connectAndDiscoverServices(macAddress);
    const result = (await this.writeWithSingleResponse(
      device,
      device.deviceType.COMMAND_BLINK,
      data => {
        const answer = this.utils.stringFromBase64(data);
        return !!answer.match(/ok/i);
      }
    )) as boolean;

    return result;
  };

  getInfo = async (macAddress: MacAddress): Promise<InfoLog> => {
    const device = await this.connectAndDiscoverServices(macAddress);

    const monitorResultCallback: MonitorCharacteristicParser<string[], InfoLog> = data => {
      const parsedBase64 = data.map(this.utils.stringFromBase64);
      const defaultInfoLog: InfoLog = { batteryLevel: null, isDisabled: true };

      const blueMaestroBatteryLevel = (info: string): number | null => {
        const batteryLevelStringOrNull = info.match(/Batt lvl: [0-9]{1,3}/);

        if (!batteryLevelStringOrNull) return batteryLevelStringOrNull;

        const batteryLevel = Number(batteryLevelStringOrNull[0].match(/[0-9]{1,3}/));

        return Number.isNaN(batteryLevel)
          ? null
          : this.utils.normaliseNumber(batteryLevel, [70, 100]);
      };

      const bt510BatteryLevel = (info: string): number | null => {
        if (JSON.parse(info).result !== 'ok') {
          /* {"jsonrpc":"2.0","id":3,"error":{"code":-32602,"message":"Attribute Not Found"}} */
          return null;
        }

        const batteryLevel = Number(JSON.parse(info).batteryVoltageMv);

        return Number.isNaN(batteryLevel)
          ? null
          : this.utils.normaliseNumber(Math.min(batteryLevel, 3000), [2100, 3000]);
      };

      const parsedIsDisabled = (info: string): boolean => !!info.match(/Btn on\/off: 1/);

      if (device.deviceType === BLUE_MAESTRO) {
        return parsedBase64.reduce((acc, info) => {
          const isDisabled = parsedIsDisabled(info);
          const batteryLevel = blueMaestroBatteryLevel(info);
          if (isDisabled) return { ...acc, isDisabled };
          if (batteryLevel) return { ...acc, batteryLevel };
          return acc;
        }, defaultInfoLog);
      } else {
        return { batteryLevel: bt510BatteryLevel(parsedBase64[0]), isDisabled: true };
      }
    };

    const result: InfoLog = (await this.writeAndMonitor(
      device,
      device.deviceType.COMMAND_INFO,
      monitorResultCallback
    )) as InfoLog;

    return result;
  };

  toggleButton = async (macAddress: MacAddress): Promise<boolean> => {
    const device = await this.connectAndDiscoverServices(macAddress);
    if (device.deviceType === BT510) {
      // Laird doesn't have this command
      return true;
    }
    const result = (await this.writeWithSingleResponse(
      device,
      BLUE_MAESTRO.COMMAND_DISABLE_BUTTON,
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
