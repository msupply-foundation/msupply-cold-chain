"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BleService = void 0;

var _BTUtilService = require("../BTUtilService");

var _buffer = require("buffer");

var _index = require("../index");

var _types = require("./types");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BleService {
  constructor(manager) {
    _defineProperty(this, "manager", void 0);

    _defineProperty(this, "utils", void 0);

    _defineProperty(this, "connectToDevice", async deviceId => {
      await this.manager.connectToDevice(deviceId);
    });

    _defineProperty(this, "connectAndDiscoverServices", async deviceDescriptor => {
      const device = this.utils.deviceDescriptorToDevice(deviceDescriptor);

      if (await this.manager.isDeviceConnected(device.id)) {
        await this.manager.cancelDeviceConnection(device.id);
      }

      await this.connectToDevice(device.id);
      await this.manager.discoverAllServicesAndCharacteristicsForDevice(device.id);
      return device;
    });

    _defineProperty(this, "stopScan", () => {
      this.manager.stopDeviceScan();
    });

    _defineProperty(this, "scanForSensors", callback => {
      const scanOptions = {
        scanMode: _types.ScanMode.LowLatency
      };

      const filteredCallback = (err, device) => {
        if (err) {
          console.log('BleService Scan Error:', JSON.stringify(err));
        }

        if (device !== null && device !== void 0 && device.manufacturerData) {
          const mfgId = _buffer.Buffer.from(device.manufacturerData, 'base64').readInt16LE(0);

          if (mfgId === _index.BLUE_MAESTRO.MANUFACTURER_ID || mfgId === _index.BT510.MANUFACTURER_ID) {
            const descriptor = this.utils.deviceToDeviceDescriptor(device.id, mfgId);
            callback(err, descriptor);
          }
        }
      };

      this.manager.startDeviceScan(null, scanOptions, filteredCallback);
    });

    _defineProperty(this, "writeCharacteristic", async (device, command) => {
      return this.manager.writeCharacteristicWithoutResponseForDevice(device.id, device.deviceType.BLUETOOTH_UART_SERVICE_UUID, device.deviceType.BLUETOOTH_READ_CHARACTERISTIC_UUID, this.utils.base64FromString(command));
    });

    _defineProperty(this, "monitorCharacteristic", (device, callback) => {
      return new Promise((resolve, reject) => {
        const subscription = this.manager.monitorCharacteristicForDevice(device.id, device.deviceType.BLUETOOTH_UART_SERVICE_UUID, device.deviceType.BLUETOOTH_WRITE_CHARACTERISTIC_UUID, (_, result) => {
          callback(result, resolve, reject, subscription);
        });
      });
    });

    _defineProperty(this, "writeAndMonitor", async (device, command, parser) => {
      const data = [];
      let done = 0;

      const alreadyDone = () => done++;

      const transmissionDone = val => {
        const str = this.utils.stringFromBase64(val);
        const pattern = /.*}$/;
        const result = pattern.test(str);
        return result;
      };

      const monitoringCallback = (result, resolve, reject, subscription) => {
        if (result !== null && result !== void 0 && result.value) {
          data.push(result.value); // return to wait for next chunk

          if (device.deviceType === _index.BLUE_MAESTRO || !transmissionDone(result.value)) return;
        }

        try {
          subscription.remove();

          if (device.deviceType === _index.BT510 && alreadyDone()) {
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
    });

    _defineProperty(this, "writeWithSingleResponse", async (device, command, parser) => {
      const monitorCharacteristicCallback = (result, resolve, reject, subscription) => {
        if (result !== null && result !== void 0 && result.value) {
          try {
            subscription === null || subscription === void 0 ? void 0 : subscription.remove();
            resolve(parser(result.value));
          } catch (e) {
            reject(new Error(`Parsing failed: ${e.message}`));
          }
        } else reject(new Error(`Command Failed`));
      };

      const monitor = this.monitorCharacteristic(device, monitorCharacteristicCallback);
      await this.writeCharacteristic(device, command);
      return monitor;
    });

    _defineProperty(this, "downloadLogs", async macAddress => {
      const device = await this.connectAndDiscoverServices(macAddress);

      const monitorCallback = data => {
        if (device.deviceType === _index.BLUE_MAESTRO) {
          const buffer = _buffer.Buffer.concat(data.slice(1).map(datum => this.utils.bufferFromBase64(datum)));

          const ind = buffer.findIndex((_, i) => i % 2 === 0 && buffer.readInt16BE(i) === _index.BLUE_MAESTRO.DELIMITER_A || buffer.readInt16BE(i) === _index.BLUE_MAESTRO.DELIMITER_B);
          return buffer.slice(0, ind).reduce((acc, _, index) => {
            if (index % 2 !== 0) return acc;
            return [...acc, {
              time: '',
              temperature: buffer.readInt16BE(index) / _index.BLUE_MAESTRO.TEMPERATURE_DIVISOR
            }];
          }, []);
        } else {
          // BT510
          const buffer = _buffer.Buffer.concat(data.map(datum => this.utils.bufferFromBase64(datum)));

          const result = JSON.parse(buffer.toString());
          const numEvents = Number(result.result[0] / 8);
          return {
            numEvents,
            data: result.result[1]
          };
        }
      }; // end monitor callback


      if (device.deviceType === _index.BT510) {
        // const FIFO = '0';
        // const LIFO = '1';
        const prepareLogs = async () => {
          const prepCommand = _index.BT510.COMMAND_PREPARE_LOG.replace('MODE', '0');

          return await this.writeWithSingleResponse(device, prepCommand, data => {
            const info = this.utils.stringFromBase64(data);
            const result = JSON.parse(info).result;
            return !!result;
          });
        };

        const ackLogs = async numEvents => {
          const ackCommand = _index.BT510.COMMAND_ACK_LOG.replace('NUMEVENTS', numEvents.toString());

          return await this.writeWithSingleResponse(device, ackCommand, data => {
            const info = this.utils.stringFromBase64(data);
            const result = !!(JSON.parse(info).result === numEvents);
            if (!result) throw new Error(`BleService ${info}`);
            return result;
          });
        };

        let sensorLog = [];

        while (await prepareLogs()) {
          const downloadCommand = _index.BT510.COMMAND_DOWNLOAD.replace('NUMEVENTS', '500');

          const dataLog = await this.writeAndMonitor(device, downloadCommand, monitorCallback);
          const logBuffer = this.utils.bufferFromBase64(dataLog.data);
          const log = logBuffer.reduce((acc, _, index) => {
            if (index % 8 !== 0) return acc; //const time = moment.unix(logBuffer.readInt32LE(index)).format('l HH:mm:ss');
            //const time = logBuffer.readInt32LE(index);

            const temperature = Math.round(logBuffer.readInt16LE(index + 4) / _index.BT510.TEMPERATURE_DIVISOR * 10) / 10;
            const eventType = logBuffer.readInt8(index + 6); //const salt = logBuffer.readInt8(index + 7);

            if (eventType === 1) {
              // temperature
              return [...acc, {
                temperature //                  eventType,
                //                  salt,

              }];
            } else {
              return [...acc];
            }
          }, []);
          sensorLog = sensorLog.concat(log);

          try {
            await ackLogs(dataLog.numEvents);
          } catch (e) {}
        } // The table only shows up on flipper, and then
        // only the first 100 items are printed.


        return sensorLog;
      } else {
        const command = _index.BLUE_MAESTRO.COMMAND_DOWNLOAD.replace('NUMEVENTS', '500');

        const result = await this.writeAndMonitor(device, command, monitorCallback);
        return result;
      }
    });

    _defineProperty(this, "updateLogInterval", async (macAddress, logInterval) => {
      const device = await this.connectAndDiscoverServices(macAddress);
      const command = device.deviceType.COMMAND_UPDATE_LOG_INTERVAL.replace('INTERVAL', logInterval.toString());
      const result = await this.writeWithSingleResponse(device, command, data => {
        const info = this.utils.stringFromBase64(data);
        return device.deviceType === _index.BT510 && JSON.parse(info).result === 'ok' || !!info.match(/interval/i);
      }); // Clear logs

      if (device.deviceType === _index.BT510) {
        this.downloadLogs(macAddress);
      }

      return !!result;
    });

    _defineProperty(this, "blink", async macAddress => {
      const device = await this.connectAndDiscoverServices(macAddress);
      const result = await this.writeWithSingleResponse(device, device.deviceType.COMMAND_BLINK, data => {
        const answer = this.utils.stringFromBase64(data);
        return !!answer.match(/ok/i);
      });
      return result;
    });

    _defineProperty(this, "getInfo", async macAddress => {
      const device = await this.connectAndDiscoverServices(macAddress);

      const monitorResultCallback = data => {
        const parsedBase64 = data.map(this.utils.stringFromBase64);
        const defaultInfoLog = {
          batteryLevel: null,
          isDisabled: true
        };

        const blueMaestroBatteryLevel = info => {
          const batteryLevelStringOrNull = info.match(/Batt lvl: [0-9]{1,3}/);
          if (!batteryLevelStringOrNull) return batteryLevelStringOrNull;
          const batteryLevel = Number(batteryLevelStringOrNull[0].match(/[0-9]{1,3}/));
          return Number.isNaN(batteryLevel) ? null : this.utils.normaliseNumber(batteryLevel, [70, 100]);
        };

        const bt510BatteryLevel = info => {
          if (JSON.parse(info).result !== 'ok') {
            /* {"jsonrpc":"2.0","id":3,"error":{"code":-32602,"message":"Attribute Not Found"}} */
            return null;
          }

          const batteryLevel = Number(JSON.parse(info).batteryVoltageMv);
          return Number.isNaN(batteryLevel) ? null : this.utils.normaliseNumber(Math.min(batteryLevel, 3000), [2100, 3000]);
        };

        const parsedIsDisabled = info => !!info.match(/Btn on\/off: 1/);

        if (device.deviceType === _index.BLUE_MAESTRO) {
          return parsedBase64.reduce((acc, info) => {
            const isDisabled = parsedIsDisabled(info);
            const batteryLevel = blueMaestroBatteryLevel(info);
            if (isDisabled) return { ...acc,
              isDisabled
            };
            if (batteryLevel) return { ...acc,
              batteryLevel
            };
            return acc;
          }, defaultInfoLog);
        } else {
          return {
            batteryLevel: bt510BatteryLevel(parsedBase64[0]),
            isDisabled: true
          };
        }
      };

      const result = await this.writeAndMonitor(device, device.deviceType.COMMAND_INFO, monitorResultCallback);
      return result;
    });

    _defineProperty(this, "toggleButton", async macAddress => {
      const device = await this.connectAndDiscoverServices(macAddress);

      if (device.deviceType === _index.BT510) {
        // Laird doesn't have this command
        return true;
      }

      const result = await this.writeWithSingleResponse(device, _index.BLUE_MAESTRO.COMMAND_DISABLE_BUTTON, data => {
        return !!this.utils.stringFromBase64(data).match(/ok/i);
      });
      return result;
    });

    _defineProperty(this, "getInfoWithRetries", async (macAddress, retriesLeft, error) => {
      if (!retriesLeft) throw error;
      return this.getInfo(macAddress).catch(err => this.getInfoWithRetries(macAddress, retriesLeft - 1, err));
    });

    _defineProperty(this, "toggleButtonWithRetries", async (macAddress, retriesLeft, error) => {
      if (!retriesLeft) throw error;
      return this.toggleButton(macAddress).catch(err => this.toggleButtonWithRetries(macAddress, retriesLeft - 1, err));
    });

    _defineProperty(this, "downloadLogsWithRetries", async (macAddress, retriesLeft, error) => {
      if (!retriesLeft) throw error;
      return this.downloadLogs(macAddress).catch(err => this.downloadLogsWithRetries(macAddress, retriesLeft - 1, err));
    });

    _defineProperty(this, "blinkWithRetries", async (macAddress, retriesLeft, error) => {
      if (!retriesLeft) throw error;
      return this.blink(macAddress).catch(err => this.blinkWithRetries(macAddress, retriesLeft - 1, err));
    });

    _defineProperty(this, "updateLogIntervalWithRetries", async (macAddress, logInterval, retriesLeft, error) => {
      if (!retriesLeft) throw error;
      return this.updateLogInterval(macAddress, logInterval).catch(err => this.updateLogIntervalWithRetries(macAddress, logInterval, retriesLeft - 1, err));
    });

    this.manager = manager;
    manager.setLogLevel(_types.LogLevel.Verbose); // Caller passes in utils from the main app,
    // but we ignore it and use our own.
    // This needs to be fixed in the main app.

    this.utils = new _BTUtilService.BTUtilService();
  }

}

exports.BleService = BleService;
//# sourceMappingURL=BleService.js.map