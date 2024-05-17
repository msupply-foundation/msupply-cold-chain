import { BtUtilService } from '../BTUtilService';

import { Buffer } from 'buffer';
import { BLUE_MAESTRO, BT510, MILLISECONDS } from '../constants';
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
import { BluetoothManager, MockOrRealDevice } from './BleManager';

// types copied from mobile/src/utilities/logging/
type Action = (message: string | Error, details?: Record<string, unknown>) => void;
interface Logger {
  trace: Action;
  debug: Action;
  info: Action;
  warn: Action;
  error: Action;
  fatal: Action;
  setLogLevel: (transportKey: string, newLevel: number) => void;
}
const dummyLogger: Logger = {
  trace: (_message, _details) => {
    /*do nothing*/
  },
  debug: (_message, _details) => {
    /*do nothing*/
  },
  info: (_message, _details) => {
    /*do nothing*/
  },
  warn: (_message, _details) => {
    /*do nothing*/
  },
  error: (_message, _details) => {
    /*do nothing*/
  },
  fatal: (_message, _details) => {
    /*do nothing*/
  },
  setLogLevel: (_transportKey, _newLevel) => {
    /*do nothing*/
  },
};

const RETRY_DELAY = MILLISECONDS.ONE_SECOND;
const sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

export class BleService {
  manager: BluetoothManager;
  utils: BtUtilService;
  logger: Logger;

  constructor(manager: BluetoothManager, logger = dummyLogger) {
    this.manager = manager;
    this.logger = logger;
    manager.setLogLevel(LogLevel.Verbose);
    // Caller passes in utils from the main app,
    // but we ignore it and use our own.
    // This needs to be fixed in the main app.
    this.utils = new BtUtilService();
    logger.info('BleService constructor called');
  }

  connectToDevice = (deviceId: string): Promise<MockOrRealDevice> => {
    this.logger.debug(`${deviceId} Connect to device`);
    try {
      return this.manager.connectToDevice(deviceId);
    } catch (e) {
      this.logger.error(`${deviceId} Error connecting to device. ${e.message}`);
      throw e;
    }
  };

  connectAndDiscoverServices = async (deviceDescriptor: string): Promise<TypedDevice> => {
    this.logger.info(`${deviceDescriptor} connectAndDiscoverServices`);
    const device = this.utils.deviceDescriptorToDevice(deviceDescriptor);
    // the Blue Maestro devices are incorrectly reporting connection status
    // thus: deviceIsConnected?	{ deviceIsConnected: true }
    // then if disconnecting [BleError: Device D7:D6:67:E0:02:34 is not connected]
    // in which case an error is thrown when trying to connect: [BleError: Device ? is already connected]
    // to work around this, we disconnect the device, ignoring any errors, before connecting again
    if (device.deviceType === BLUE_MAESTRO) {
      this.logger.debug(`${deviceDescriptor} Connecting to BM device`);
      try {
        await this.manager.cancelDeviceConnection(device.id);
      } catch (e) {
        this.logger.warn(`${deviceDescriptor} Error disconnecting! ${e.message}`);
        // ignore error
      }
    } else {
      this.logger.debug(`${deviceDescriptor} Connecting to other device`);
      const deviceIsConnected = await this.manager.isDeviceConnected(device.id);
      if (deviceIsConnected) {
        this.logger.debug(`${deviceDescriptor} Disconnecting`);
        await this.manager.cancelDeviceConnection(device.id);
      }
    }
    await this.connectToDevice(device.id);
    this.logger.debug(`${device.id} Connected to ${deviceDescriptor}`);

    await this.manager.discoverAllServicesAndCharacteristicsForDevice(device.id);
    this.logger.info(
      `${deviceDescriptor} Discovered all services and characteristics. id: ${device.id} manufacturer: ${device.deviceType.MANUFACTURER_ID}`
    );

    return device;
  };

  stopScan = (): void => {
    this.manager.stopDeviceScan();
  };

  scanForSensors = (callback: ScanCallback): void => {
    this.logger.info('Scanning for sensors');
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
    callback: MonitorCharacteristicCallback<boolean | SensorLog[] | InfoLog | DataLog>,
    transactionId: string
  ): Promise<boolean | SensorLog[] | InfoLog | DataLog> => {
    return new Promise((resolve, reject) => {
      const subscription = this.manager.monitorCharacteristicForDevice(
        device.id,
        device.deviceType.BLUETOOTH_UART_SERVICE_UUID,
        device.deviceType.BLUETOOTH_WRITE_CHARACTERISTIC_UUID,
        (error, result) => {
          callback(result, resolve, reject, subscription, error);
        },
        transactionId
      );
    });
  };

  // https://gist.github.com/gordonbrander/2230317
  transactionId = (): string => '_' + Math.random().toString(36).substr(2, 9);

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
      const pattern = new RegExp('.*}$'); // workaround for emacs web mode confused by bracket in a regexp literal
      const result = pattern.test(str);
      return result;
    };

    const monitoringCallback: MonitorCharacteristicCallback<SensorLog[] | InfoLog | DataLog> = (
      result,
      resolve,
      reject,
      subscription,
      error
    ) => {
      this.logger.debug(`${device.id} Monitor command: ${command}`);
      this.logger.debug(`${device.id} Monitor callback result valid: ${Boolean(result?.value)}`);
      if (error) {
        this.logger.debug(`${device.id} Monitor callback error name: ${error.name}`);
        this.logger.debug(`${device.id} Monitor callback error message: ${error.message}`);
        this.logger.debug(`${device.id} Monitor callback error reason: ${error.reason}`);
      }

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
        this.logger.debug(`${device.id} Monitor callback. Data length: ${data.length}`);

        if (data.length === 0) throw new Error(' callback no data returned');
        resolve(parser(data));
      } catch (e) {
        reject(new Error(` callback parsing failed, ${e.message}`));
      }
    }; // end monitoringCallback

    const transactionId = this.transactionId();
    const monitor = this.monitorCharacteristic(device, monitoringCallback, transactionId);

    // We only care about the result if both the write and monitor succeed.
    return Promise.all([monitor, this.writeCharacteristic(device, command)])
      .then(r => r[0])
      .catch(e => {
        this.manager.cancelTransaction(transactionId);
        this.logger.error(`${device.id}  writeAndMonitor rejected. ${e.message}`);
        throw new Error(` writeAndMonitor rejected, ${device.id} ${e.message}`);
      });
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
      subscription?.remove();
      if (result?.value) {
        try {
          resolve(parser(result.value));
        } catch (e) {
          reject(new Error(` callback parsing failed: ${e.message}`));
        }
      } else reject(new Error(` callback returns null`));
    }; // end monitorCharacteristicCallback

    const transactionId = this.transactionId();
    const monitor = this.monitorCharacteristic(
      device,
      monitorCharacteristicCallback,
      transactionId
    );
    // We only care about the result if both the write and monitor succeed.
    return Promise.all([monitor, this.writeCharacteristic(device, command)])
      .then(r => r[0])
      .catch(e => {
        this.manager.cancelTransaction(transactionId);
        throw new Error(` writeWithSingleResponse rejected, ${device.id} ${e.message}`);
      });
  };

  /** Facade for clearing logs.
   *
   * Connects with a sensor and clears all temperature logs.
   *
   * Returns a promise which resolves to boolean, which is ignored by the caller.
   *
   * @param {String} macAddress
   */
  clearLogs = async (macAddress: MacAddress): Promise<void> => {
    this.logger.debug(`${macAddress} Clearing logs`);
    const device = await this.connectAndDiscoverServices(macAddress);
    if (device?.deviceType === BT510) {
      await this.downloadLogs(macAddress);
    } else {
      await this.writeWithSingleResponse(
        device,
        BLUE_MAESTRO.COMMAND_CLEAR,
        data => !!this.utils.stringFromBase64(data)
      );
    }
  };

  downloadLogs = async (macAddress: MacAddress): Promise<SensorLog[]> => {
    this.logger.debug(`${macAddress} Download logs`);
    const device = await this.connectAndDiscoverServices(macAddress);
    this.logger.info(`${macAddress} Download logs connected and discovered services`);
    const monitorCallback: MonitorCharacteristicParser<string[], SensorLog[] | DataLog> = (
      data: string[]
    ) => {
      this.logger.info(`${macAddress} Write and monitor found some data! ${data.length}`);
      this.logger.debug(`${macAddress} ${data.join('; ')}`);
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
      this.logger.debug(`${macAddress} Preparing to download logs`);
      const prepareLogs = async (): Promise<boolean> => {
        const prepCommand = BT510.COMMAND_PREPARE_LOG.replace('MODE', '0');

        return (await this.writeWithSingleResponse(device, prepCommand, data => {
          const info = this.utils.stringFromBase64(data);
          this.logger.debug(`${macAddress} Prepare logs response: ${info}`);
          return JSON.parse(info).result !== 0;
        })) as boolean;
      };
      const ackLogs = async (numEvents: number): Promise<boolean> => {
        const ackCommand = BT510.COMMAND_ACK_LOG.replace('NUMEVENTS', numEvents.toString());
        return (await this.writeWithSingleResponse(device, ackCommand, data => {
          const info = this.utils.stringFromBase64(data);
          return JSON.parse(info).result === numEvents;
        })) as boolean;
      };

      let sensorLog = [] as SensorLog[];
      try {
        while (await prepareLogs()) {
          const downloadCommand = BT510.COMMAND_DOWNLOAD.replace('NUMEVENTS', '500');
          this.logger.debug(`${macAddress} Sending download command`);
          const dataLog = (await this.writeAndMonitor(
            device,
            downloadCommand,
            monitorCallback
          )) as DataLog;
          const logBuffer = this.utils.bufferFromBase64(dataLog.data);

          const log = logBuffer.reduce((acc: SensorLog[], _, index) => {
            if (index % 8 !== 0) return acc;
            //const time = logBuffer.readInt32LE(index);
            const temperature =
              Math.round((logBuffer.readInt16LE(index + 4) / BT510.TEMPERATURE_DIVISOR) * 10) / 10;
            const eventType = logBuffer.readInt8(index + 6);
            //const salt = logBuffer.readInt8(index + 7);
            if (eventType === 1) {
              return [
                ...acc,
                {
                  temperature,
                },
              ];
            } else {
              return [...acc];
            }
          }, []);

          if (await ackLogs(dataLog.numEvents)) {
            this.logger.debug(`${macAddress} Ack received`);
            sensorLog = sensorLog.concat(log);
          }
        }
      } catch (e) {
        this.logger.error(`${macAddress} Error downloading logs. ${e.message}`);
        if (sensorLog.length === 0) {
          throw new Error(`downloadLogs ${e.message}`);
        }
        // But if we partially succeeded, return that
      }
      return sensorLog;
    } else {
      try {
        const command = BLUE_MAESTRO.COMMAND_DOWNLOAD.replace('NUMEVENTS', '500');
        this.logger.debug(`${macAddress} Sending download command`);
        const result = (await this.writeAndMonitor(
          device,
          command,
          monitorCallback
        )) as SensorLog[];
        return result;
      } catch (e) {
        this.logger.error(`${macAddress} Error downloading logs! ${e.message}`);
        throw new Error(`downloadLogs ${e.message}`);
      }
    }
  };

  updateLogInterval = async (
    macAddress: MacAddress,
    logInterval: number,
    clearLogs = true
  ): Promise<boolean> => {
    this.logger.debug(`${macAddress} Update log interval`);
    const device = await this.connectAndDiscoverServices(macAddress);

    const command = device.deviceType.COMMAND_UPDATE_LOG_INTERVAL.replace(
      'LOG_INTERVAL',
      logInterval.toString()
    );
    const result = await this.writeWithSingleResponse(device, command, data => {
      const info = this.utils.stringFromBase64(data);
      return (
        (device.deviceType === BT510 && JSON.parse(info).result === 'ok') ||
        !!info.match(/interval/i)
      );
    });
    // Clear logs if we haven't just downloaded
    // BlueMaestro automatically clears logs when log interval is set,
    // But we have to download all the logs to clear them on BT510
    if (clearLogs && device.deviceType === BT510) {
      await this.downloadLogs(macAddress);
    }
    if (result) return true;
    throw new Error(` command returned not OK result`);
  };

  blink = async (macAddress: MacAddress): Promise<boolean> => {
    this.logger.debug(`${macAddress} Blink`);
    const device = await this.connectAndDiscoverServices(macAddress);
    const result = (await this.writeWithSingleResponse(
      device,
      device.deviceType.COMMAND_BLINK,
      data => {
        const answer = this.utils.stringFromBase64(data);
        return !!answer.match(/ok/i);
      }
    )) as boolean;

    if (result) return true;
    throw new Error(` acknowledgement false`);
  };

  getInfo = async (macAddress: MacAddress): Promise<InfoLog> => {
    this.logger.debug(`${macAddress} Get info`);
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
          : this.utils.normaliseNumber(batteryLevel, [75, 100]);
      };

      const bt510BatteryLevel = (info: string): number | null => {
        let batteryLevel: number | null = null;
        if (info) {
          const parsedInfo = JSON.parse(info);

          if (parsedInfo?.result !== 'ok') {
            return null;
          }

          batteryLevel = Number(parsedInfo.batteryVoltageMv);
        } else {
          return null;
        }
        return Number.isNaN(batteryLevel)
          ? null
          : this.utils.normaliseNumber(Math.min(batteryLevel, 3000), [2250, 3000]);
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
    this.logger.debug(`${macAddress} Toggle button`);
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
    if (!retriesLeft) {
      this.logger.error(`${macAddress} getInfoWithRetries failed. ${error?.message}`);
      throw error;
    }

    await sleep(RETRY_DELAY);

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

    await sleep(RETRY_DELAY);

    return this.toggleButton(macAddress).catch(err =>
      this.toggleButtonWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  downloadLogsWithRetries = async (
    macAddress: MacAddress,
    retriesLeft: number,
    error: Error | null
  ): Promise<SensorLog[]> => {
    this.logger.info(`${macAddress} Download logs with retries`);
    this.logger.debug(
      `${macAddress} Starting to download logs. There are ${retriesLeft} retries left. Error: ${error?.message}`
    );
    if (!retriesLeft) throw error;

    await sleep(RETRY_DELAY);

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

    await sleep(RETRY_DELAY);

    return this.blink(macAddress).catch(err =>
      this.blinkWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  updateLogIntervalWithRetries = async (
    macAddress: MacAddress,
    logInterval: number,
    retriesLeft: number,
    clearLogs: boolean,
    error: Error | null
  ): Promise<boolean> => {
    if (!retriesLeft) throw error;

    await sleep(RETRY_DELAY);

    return this.updateLogInterval(macAddress, logInterval, clearLogs).catch(err =>
      this.updateLogIntervalWithRetries(macAddress, logInterval, retriesLeft - 1, clearLogs, err)
    );
  };
}
