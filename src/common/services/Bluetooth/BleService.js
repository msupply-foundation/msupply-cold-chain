import { Buffer } from 'buffer';
import { BLUE_MAESTRO, BLUETOOTH } from '~constants';

const bufferFromBase64 = base64 => Buffer.from(base64, 'base64');
const stringFromBase64 = base64 => bufferFromBase64(base64).toString('utf-8');
const base64FromString = string => Buffer.from(string, 'utf-8').toString('base64');

export class BleService {
  constructor(manager) {
    this.manager = manager;
  }

  connectToDevice = async macAddress => {
    return this.manager.connectToDevice(macAddress, { scanMode: BLUETOOTH.SCAN_MODE_LOW_LATENCY });
  };

  connectAndDiscoverServices = async macAddress => {
    if (await this.manager.isDeviceConnected(macAddress)) {
      await this.manager.cancelDeviceConnection(macAddress);
    }

    const device = await this.connectToDevice(macAddress);
    await this.manager.discoverAllServicesAndCharacteristicsForDevice(macAddress);

    return device;
  };

  stopScan = () => {
    this.manager.stopDeviceScan();
  };

  scanForSensors = callback => {
    this.manager.startDeviceScan(
      null,
      { scanMode: BLUETOOTH.SCAN_MODE_LOW_LATENCY },
      (_, device) => {
        const { manufacturerData } = device;
        if (bufferFromBase64(manufacturerData).readInt16LE(0) === BLUE_MAESTRO.MANUFACTURER_ID) {
          callback(device);
        }
      },
      callback
    );
  };

  writeCharacteristic = (macAddress, command) => {
    return this.manager.writeCharacteristicWithoutResponseForDevice(
      macAddress,
      BLUETOOTH.UART_SERVICE_UUID,
      BLUETOOTH.READ_CHARACTERISTIC_UUID,
      base64FromString(command)
    );
  };

  monitorCharacteristic = (macAddress, callback) => {
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

  writeAndMonitor = async (macAddress, command, parser) => {
    const monitor = this.monitorCharacteristic(
      macAddress,
      (() => {
        const data = [];

        return (result, resolve, reject) => {
          if (result?.value) data.push(result.value);
          else {
            try {
              resolve(parser(data));
            } catch (e) {
              reject(new Error(`Parsing failed:  ${e.message}`));
            }
          }
        };
      })()
    );

    await this.writeCharacteristic(macAddress, command);

    return monitor;
  };

  sendCommand = async (macAddress, command, parser) => {
    await this.connectAndDiscoverServices(macAddress);
    return this.writeAndMonitor(macAddress, command, parser);
  };

  downloadLogs = async macAddress => {
    return this.sendCommand(macAddress, BLUE_MAESTRO.COMMANDS.DOWNLOAD, data => {
      const buffer = Buffer.concat(data.slice(1).map(datum => bufferFromBase64(datum)));

      const ind = buffer.findIndex(
        (_, i) =>
          (i % 2 === 0 && buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_A) ||
          buffer.readInt16BE(i) === BLUE_MAESTRO.DELIMITER_B
      );

      return buffer.slice(0, ind).reduce((acc, _, index, buf) => {
        if (index % 2 !== 0) return acc;
        return [...acc, { temperature: buf.readInt16BE(index) / BLUE_MAESTRO.TEMPERATURE_DIVISOR }];
      }, []);
    });
  };

  updateLogInterval = async (macAddress, logInterval) => {
    return this.sendCommand(
      macAddress,
      `${BLUE_MAESTRO.COMMANDS.UPDATE_LOG_INTERVAL}${logInterval}`,
      data => {
        const [datum] = data;
        return stringFromBase64(datum);
      }
    );
  };

  blink = async macAddress => {
    return this.sendCommand(macAddress, BLUE_MAESTRO.COMMANDS.BLINK, data => {
      const [datum] = data;
      return !!stringFromBase64(datum).match(/ok/i);
    });
  };

  getInfo = async macAddress => {
    return this.sendCommand(macAddress, BLUE_MAESTRO.COMMANDS.INFO, data =>
      data
        .map(datum => stringFromBase64(datum))
        .reduce((acc, info) => {
          if (info.match(/Batt/)) return { ...acc, batteryLevel: info.match(/[0-9]{1,3}/)[0] };
          if (info.match(/Btn on\/off: 1/)) return { ...acc, isDisabled: true };
          return acc;
        }, {})
    );
  };

  toggleButton = async macAddress => {
    return this.sendCommand(macAddress, BLUE_MAESTRO.COMMANDS.DISABLE_BUTTON, data => {
      const [datum] = data;
      return !!stringFromBase64(datum).match(/ok/i);
    });
  };

  getInfoWithRetries = async (macAddress, retriesLeft, error) => {
    if (!retriesLeft) throw error;

    return this.getInfo(macAddress).catch(err =>
      this.getInfoWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  toggleButtonWithRetries = async (macAddress, retriesLeft, error) => {
    if (!retriesLeft) throw error;

    return this.toggleButton(macAddress).catch(err =>
      this.toggleButtonWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  downloadLogsWithRetries = async (macAddress, retriesLeft, error) => {
    if (!retriesLeft) throw error;

    return this.downloadLogs(macAddress).catch(err =>
      this.downloadLogsWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  blinkWithRetries = async (macAddress, retriesLeft, error) => {
    if (!retriesLeft) throw error;

    return this.blink(macAddress).catch(err =>
      this.blinkWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  updateLogIntervalWithRetries = async (macAddress, logInterval, retriesLeft, error) => {
    if (!retriesLeft) throw error;

    return this.updateLogInterval(macAddress, logInterval).catch(err =>
      this.updateLogIntervalWithRetries(macAddress, logInterval, retriesLeft - 1, err)
    );
  };
}
