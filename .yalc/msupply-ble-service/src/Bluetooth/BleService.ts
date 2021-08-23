import { BTUtilService } from '../BTUtilService';

import { Buffer } from 'buffer';
import { BLUE_MAESTRO, BT510 } from '../index';
import { MacAddress } from '../types/common';
import moment from 'moment';
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
  DeviceType,
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

  deviceConstants = (device: Pick<Device, 'id' | 'name'> | null): DeviceType => {
    if (device?.name) {
      if (device.name === 'BT510') {
        // Laird doesn't include Manufacurer Data in connect response.
        return BT510;
      } else {
        // Blue Maestro has part of the mac address as its name.
        // We could check this but...
        return BLUE_MAESTRO;
      }
    }
    throw new Error('device or name is null');
  };

  connectToDevice = async (macAddress: MacAddress): Promise<TypedDevice> => {
    const device = await this.manager.connectToDevice(macAddress);
    console.log(`BleService connectToDevice, device, id ${device?.id}, name ${device?.name}`);
    return { id: device.id, deviceType: this.deviceConstants(device) };
  };

  connectAndDiscoverServices = async (macAddress: MacAddress): Promise<TypedDevice> => {
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
    const filteredCallback: ScanCallback = (err: BleError | null, device: Device | null): void => {
      if (err) {
        console.log('BleService Scan Error:', JSON.stringify(err));
      }

      if (device?.manufacturerData) {
        const mfgId = Buffer.from(device.manufacturerData, 'base64').readInt16LE(0);
        if (mfgId === BLUE_MAESTRO.MANUFACTURER_ID || mfgId === BT510.MANUFACTURER_ID) {
          // console.log(
          //   `BleService Found device: ${device.id}, ${device.name}, ${mfgId}`
          // );
          callback(err, device);
        }
      }
    };
    this.manager.startDeviceScan(null, scanOptions, filteredCallback);
    console.log('BleService Started scan');
    //this.manager.logLevel().then(value => console.log(`Log Level ${value}`));
  };

  writeCharacteristic = async (device: TypedDevice, command: string): Promise<Characteristic> => {
    //console.log(`BleService Writing to ${device.id}`);
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
    //console.log(`BleService Monitoring from ${device.id}`);
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
      //console.log(`BleService Monitor receives ${str.slice(0, 10)}, ${result}`);
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
        // console.log(
        //   `BleService SingleMonitor receives ${this.utils
        //     .stringFromBase64(result.value)
        //     .slice(0, 10)}`
        // );
        try {
          subscription?.remove();
          resolve(parser(result.value));
        } catch (e) {
          reject(new Error(`Parsing failed: ${e.message}`));
        }
      } else reject(new Error(`Command Failed`));
    };
    //console.log(`BleService writeWithSingleResponse: ${command}`);
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
        console.table(data.concat(['BleService']));
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
        console.log(`BleService downloaded ${numEvents} events`);
        //        console.log(`BleService data is ${result.result[1].slice(0, 10)}`);
        return { numEvents, data: result.result[1] };
      }
    };
    if (device.deviceType === BT510) {
      // const FIFO = '0';
      // const LIFO = '1';

      const prepareLogs = async (): Promise<boolean> => {
        const prepCommand = BT510.COMMAND_PREPARE_LOG.replace('MODE', '0');
        return (await this.writeWithSingleResponse(device, prepCommand, data => {
          const info = this.utils.stringFromBase64(data);
          const result = JSON.parse(info).result;
          console.log(`BleService Log Prepared, ${result} events`);
          return !!result;
        })) as boolean;
      };
      const ackLogs = async (numEvents: number): Promise<boolean> => {
        const ackCommand = BT510.COMMAND_ACK_LOG.replace('NUMEVENTS', numEvents.toString());
        return (await this.writeWithSingleResponse(device, ackCommand, data => {
          const info = this.utils.stringFromBase64(data);
          const result = !!(JSON.parse(info).result === numEvents);
          if (!result) throw new Error(`BleService ${info}`);
          console.log(`BleService Log Acknowledged, ${numEvents} events`);
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
          const time = moment.unix(logBuffer.readInt32LE(index)).format('l HH:mm:ss');
          //const time = logBuffer.readInt32LE(index);
          const temperature =
            Math.round((logBuffer.readInt16LE(index + 4) / BT510.TEMPERATURE_DIVISOR) * 10) / 10;
          const eventType = logBuffer.readInt8(index + 6);
          //console.log(`BleService reducing event ${time}, ${temperature}, ${eventType}`);
          const salt = logBuffer.readInt8(index + 7);
          if (eventType === 1) {
            // temperature
            return [
              ...acc,
              {
                time,
                temperature,
                //                  eventType,
                //                  salt,
              },
            ];
          } else {
            console.log(
              `BleService Event type ${eventType}, Data: ${Number(
                logBuffer.readInt16LE(index + 4)
              )}, Time: ${time}, Salt: ${salt}`
            );
            return [...acc];
          }
        }, []);
        //console.log(`BleService log ${JSON.stringify(log)}`);

        sensorLog = sensorLog.concat(log);
        //console.log(`BleService sensorLog inside while loop ${JSON.stringify(sensorLog)}`);
        try {
          await ackLogs(dataLog.numEvents);
        } catch (e) {
          console.log(`BleService Ack failed ${e.message}`);
        }
      }
      // The table only shows up on flipper, and then
      // only the first 100 items are printed.
      console.table(
        [
          { time: '', temperature: 'BleService' as unknown as number },
          { time: '', temperature: device.id as unknown as number },
        ].concat(sensorLog)
      );
      return sensorLog;
    } else {
      const command = BLUE_MAESTRO.COMMAND_DOWNLOAD.replace('NUMEVENTS', '500');
      const result = (await this.writeAndMonitor(device, command, monitorCallback)) as SensorLog[];
      console.table(
        [
          { time: '', temperature: 'BleService' as unknown as number },
          {
            time: '',
            temperature: device.id as unknown as number,
          },
        ].concat(result)
      );
      return result;
    }
  };

  updateLogInterval = async (macAddress: MacAddress, logInterval: number): Promise<boolean> => {
    const device = await this.connectAndDiscoverServices(macAddress);
    const command = device.deviceType.COMMAND_UPDATE_LOG_INTERVAL.replace(
      'INTERVAL',
      logInterval.toString()
    );
    console.log(`BleService logInterval command: ${command}`);
    const result = await this.writeWithSingleResponse(device, command, data => {
      const info = this.utils.stringFromBase64(data);
      return (
        (device.deviceType === BT510 && JSON.parse(info).result === 'ok') ||
        !!info.match(/interval/i)
      );
    });
    // Clear logs
    if (device.deviceType === BT510) {
      this.downloadLogs(device.id);
    }
    //console.log(`BleService logInterval result: ${result}`);
    return !!result;
  };

  blink = async (macAddress: MacAddress): Promise<boolean> => {
    const device = await this.connectAndDiscoverServices(macAddress);
    //console.log(`BleService Blinking ${device.deviceType.COMMAND_BLINK}`);
    const result = (await this.writeWithSingleResponse(
      device,
      device.deviceType.COMMAND_BLINK,
      data => {
        const answer = this.utils.stringFromBase64(data);
        //console.log(`BleService data returned from blink write: ${result}`);
        return !!answer.match(/ok/i);
      }
    )) as boolean;

    return result;
  };

  getInfo = async (macAddress: MacAddress): Promise<InfoLog> => {
    const device = await this.connectAndDiscoverServices(macAddress);
    //console.log(`BleService getInfo, ${device.id}`);

    const monitorResultCallback: MonitorCharacteristicParser<string[], InfoLog> = data => {
      const parsedBase64 = data.map(this.utils.stringFromBase64);
      const defaultInfoLog: InfoLog = { batteryLevel: null, isDisabled: true };
      //console.log(`BleService getInfo parser callback ${parsedBase64[0]}`);
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
        //console.log(`BleService Battery Level ${batteryLevel}`);

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
    console.log(`BleService getInfo ${device.id} ${JSON.stringify(result)}`);
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
