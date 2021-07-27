function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

import { Buffer } from 'buffer';
import { BLUE_MAESTRO, BLUETOOTH } from '../index';
import { ScanMode, LogLevel } from './types';
export class BleService {
  constructor(manager, utils) {
    _defineProperty(this, 'manager', void 0);

    _defineProperty(this, 'utils', void 0);

    _defineProperty(this, 'connectToDevice', async macAddress => {
      return this.manager.connectToDevice(macAddress);
    });

    _defineProperty(this, 'connectAndDiscoverServices', async macAddress => {
      if (await this.manager.isDeviceConnected(macAddress)) {
        await this.manager.cancelDeviceConnection(macAddress);
      }

      const device = await this.connectToDevice(macAddress);
      await this.manager.discoverAllServicesAndCharacteristicsForDevice(macAddress);
      return device;
    });

    _defineProperty(this, 'stopScan', () => {
      this.manager.stopDeviceScan();
    });

    _defineProperty(this, 'scanForSensors', callback => {
      const scanOptions = {
        scanMode: ScanMode.LowLatency,
      };
      this.manager.startDeviceScan(null, scanOptions, callback);
      console.log('Started scan');
      this.manager.logLevel().then(value => console.log(`Log Level ${value}`));
    });

    _defineProperty(this, 'writeCharacteristic', async (macAddress, command) => {
      return this.manager.writeCharacteristicWithoutResponseForDevice(
        macAddress,
        BLUETOOTH.UART_SERVICE_UUID,
        BLUETOOTH.READ_CHARACTERISTIC_UUID,
        this.utils.base64FromString(command)
      );
    });

    _defineProperty(this, 'monitorCharacteristic', (macAddress, callback) => {
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
    });

    _defineProperty(this, 'writeAndMonitor', async (macAddress, command, parser) => {
      const data = [];

      const monitoringCallback = (result, resolve, reject) => {
        if (result !== null && result !== void 0 && result.value) data.push(result.value);
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
    });

    _defineProperty(this, 'writeWithSingleResponse', async (macAddress, command, parser) => {
      const monitorCharacteristicCallback = (result, resolve, reject) => {
        if (result !== null && result !== void 0 && result.value) {
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
    });

    _defineProperty(this, 'downloadLogs', async macAddress => {
      await this.connectAndDiscoverServices(macAddress);

      const monitorCallback = data => {
        const buffer = Buffer.concat(
          data.slice(1).map(datum => this.utils.bufferFromBase64(datum))
        );
        const ind = buffer.findIndex(
          (_, i) =>
            (i % 2 === 0 && buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_A) ||
            buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_B
        );
        return buffer.slice(0, ind).reduce((acc, _, index) => {
          if (index % 2 !== 0) return acc;
          return [
            ...acc,
            {
              temperature: buffer.readInt16BE(index) / BLUE_MAESTRO.TEMPERATURE_DIVISOR,
            },
          ];
        }, []);
      };

      const result = await this.writeAndMonitor(
        macAddress,
        BLUE_MAESTRO.COMMANDS.DOWNLOAD,
        monitorCallback
      );
      return result;
    });

    _defineProperty(this, 'updateLogInterval', async (macAddress, logInterval) => {
      await this.connectAndDiscoverServices(macAddress);
      const result = await this.writeWithSingleResponse(
        macAddress,
        `${BLUE_MAESTRO.COMMANDS.UPDATE_LOG_INTERVAL}${logInterval}`,
        data => !!this.utils.stringFromBase64(data).match(/interval/i)
      );
      return !!result;
    });

    _defineProperty(this, 'blink', async macAddress => {
      await this.connectAndDiscoverServices(macAddress);
      const result = await this.writeWithSingleResponse(
        macAddress,
        BLUE_MAESTRO.COMMANDS.BLINK,
        data => {
          return !!this.utils.stringFromBase64(data).match(/ok/i);
        }
      );
      return result;
    });

    _defineProperty(this, 'getInfo', async macAddress => {
      await this.connectAndDiscoverServices(macAddress);

      const monitorResultCallback = data => {
        const parsedBase64 = data.map(this.utils.stringFromBase64);
        const defaultInfoLog = {
          batteryLevel: null,
          isDisabled: true,
        };

        const parsedBatteryLevel = info => {
          const batteryLevelStringOrNull = info.match(/Batt lvl: [0-9]{1,3}/);
          if (!batteryLevelStringOrNull) return batteryLevelStringOrNull;
          const batteryLevel = Number(batteryLevelStringOrNull[0].match(/[0-9]{1,3}/));
          return Number.isNaN(batteryLevel)
            ? null
            : this.utils.normaliseNumber(batteryLevel, [70, 100]);
        };

        const parsedIsDisabled = info => !!info.match(/Btn on\/off: 1/);

        return parsedBase64.reduce((acc, info) => {
          const isDisabled = parsedIsDisabled(info);
          const batteryLevel = parsedBatteryLevel(info);
          if (isDisabled) return { ...acc, isDisabled };
          if (batteryLevel) return { ...acc, batteryLevel };
          return acc;
        }, defaultInfoLog);
      };

      const result = await this.writeAndMonitor(
        macAddress,
        BLUE_MAESTRO.COMMANDS.INFO,
        monitorResultCallback
      );
      return result;
    });

    _defineProperty(this, 'toggleButton', async macAddress => {
      await this.connectAndDiscoverServices(macAddress);
      const result = await this.writeWithSingleResponse(
        macAddress,
        BLUE_MAESTRO.COMMANDS.DISABLE_BUTTON,
        data => {
          return !!this.utils.stringFromBase64(data).match(/ok/i);
        }
      );
      return result;
    });

    _defineProperty(this, 'getInfoWithRetries', async (macAddress, retriesLeft, error) => {
      if (!retriesLeft) throw error;
      return this.getInfo(macAddress).catch(err =>
        this.getInfoWithRetries(macAddress, retriesLeft - 1, err)
      );
    });

    _defineProperty(this, 'toggleButtonWithRetries', async (macAddress, retriesLeft, error) => {
      if (!retriesLeft) throw error;
      return this.toggleButton(macAddress).catch(err =>
        this.toggleButtonWithRetries(macAddress, retriesLeft - 1, err)
      );
    });

    _defineProperty(this, 'downloadLogsWithRetries', async (macAddress, retriesLeft, error) => {
      if (!retriesLeft) throw error;
      return this.downloadLogs(macAddress).catch(err =>
        this.downloadLogsWithRetries(macAddress, retriesLeft - 1, err)
      );
    });

    _defineProperty(this, 'blinkWithRetries', async (macAddress, retriesLeft, error) => {
      if (!retriesLeft) throw error;
      return this.blink(macAddress).catch(err =>
        this.blinkWithRetries(macAddress, retriesLeft - 1, err)
      );
    });

    _defineProperty(
      this,
      'updateLogIntervalWithRetries',
      async (macAddress, logInterval, retriesLeft, error) => {
        if (!retriesLeft) throw error;
        return this.updateLogInterval(macAddress, logInterval).catch(err =>
          this.updateLogIntervalWithRetries(macAddress, logInterval, retriesLeft - 1, err)
        );
      }
    );

    this.manager = manager;
    manager.setLogLevel(LogLevel.Verbose); // In the future we may want to use our own utils,
    //  not the ones passed in from the app.
    //this.utils = new BTUtilService();

    this.utils = utils;
  }
}
//# sourceMappingURL=BleService.js.map
