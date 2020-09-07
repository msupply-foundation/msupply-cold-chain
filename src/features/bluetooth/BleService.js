/* eslint-disable operator-assignment */
/* eslint-disable no-bitwise */
import Base64 from 'react-native-base64';
import { Buffer } from 'buffer';
import { BLUETOOTH } from '~constants';

const convertToSignedInt = (byteA, byteB) => {
  const sign = byteA & (1 << 7);
  let result = ((byteA & 0xff) << 8) | (byteB & 0xff);
  if (sign) {
    result = 0xffff0000 | result;
  }
  return result;
};

function toInt(byteArray, startPosition) {
  return convertToSignedInt(byteArray[startPosition], byteArray[startPosition + 1]);
}

function parseDownloadedData(downloadedData) {
  try {
    const temperatureReadings = [];
    const rawResultLines = downloadedData;

    const totalNumberOfRecords = toInt(rawResultLines[0], 4);
    for (let i = 1; i < rawResultLines.length; i += 1) {
      const line = rawResultLines[i];

      for (let y = 0; y < line.length; y += 2) {
        const reading = toInt(line, y);
        if (reading === 11308 || reading === 11776) {
          return {
            temperatureReadings,
            totalNumberOfRecords,
          };
        }

        temperatureReadings.push(reading);
      }
    }

    return {
      failedParsing: true,
    };
  } catch (e) {
    return {
      failedParsing: true,
    };
  }
}

const checkForManufacturerId = device => {
  const { manufacturerData } = device ?? {};
  if (!manufacturerData) return false;

  const decodedBase64 = Base64.decode(manufacturerData);
  const dataLength = decodedBase64.length;
  const manufacturerDataArray = new Int8Array(new ArrayBuffer(dataLength));

  for (let i = 0; i < dataLength; i += 1) {
    manufacturerDataArray[i] = decodedBase64.charCodeAt(i);
  }

  return ((manufacturerDataArray[1] << 8) | manufacturerDataArray[0]) === 307;
};

export class BleService {
  constructor(manager) {
    this.manager = manager;
    this.downloading = {};
  }

  connectToDevice = async macAddress => {
    return this.manager.connectToDevice(macAddress);
  };

  stopScan = () => {
    this.manager.stopDeviceScan();
  };

  scanForSensors = callback => {
    this.manager.startDeviceScan(null, { scanMode: 2 }, (_, device) => {
      if (checkForManufacturerId(device)) {
        callback(device);
      }
    });
  };

  downloadLogs = async macAddress => {
    if (this.downloading[macAddress]) throw new Error('Already downloading');
    this.downloading[macAddress] = true;

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolver, reject) => {
      try {
        const device = await this.connectToDevice(macAddress);

        const data = [];
        device.onDisconnected(async () => {
          const parsedData = parseDownloadedData(data);
          try {
            resolver(
              parsedData?.temperatureReadings.map(temp => ({ temperature: temp / 10.0 })) ?? []
            );
          } catch (error) {
            reject(error);
          }
          this.downloading[macAddress] = false;
        });

        await device.discoverAllServicesAndCharacteristics();
        await this.manager.monitorCharacteristicForDevice(
          macAddress,
          BLUETOOTH.UART_SERVICE_UUID,
          BLUETOOTH.WRITE_CHARACTERISTIC_UUID,
          (_, characteristic) => {
            if (characteristic?.value) {
              const raw = Base64.decode(characteristic.value);
              const rawLength = raw.length;
              const array = new Int16Array(new ArrayBuffer(rawLength * 2));
              for (let i = 0; i < rawLength; i += 1) array[i] = raw.charCodeAt(i);
              data.push(array);
            }
          }
        );

        await this.manager.writeCharacteristicWithoutResponseForDevice(
          macAddress,
          BLUETOOTH.UART_SERVICE_UUID,
          BLUETOOTH.READ_CHARACTERISTIC_UUID,
          Buffer.from('*logall', 'utf-8').toString('base64')
        );
      } catch (error) {
        this.downloading[macAddress] = false;
        reject(error);
      }
    });
  };

  updateLogInterval = async (macAddress, logInterval) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolver, reject) => {
      try {
        const device = await this.connectToDevice(macAddress);
        await device.discoverAllServicesAndCharacteristics();

        await this.manager.monitorCharacteristicForDevice(
          macAddress,
          BLUETOOTH.UART_SERVICE_UUID,
          BLUETOOTH.WRITE_CHARACTERISTIC_UUID,

          (_, result) => {
            if (result?.value) {
              const raw = Base64.decode(result.value);
              const rawLength = raw.length;
              const array = new Uint8Array(new ArrayBuffer(rawLength));

              for (let i = 0; i < rawLength; i += 1) array[i] = raw.charCodeAt(i);

              resolver(array);

              device.cancelConnection();
            }
          }
        );

        this.manager.writeCharacteristicWithoutResponseForDevice(
          macAddress,
          BLUETOOTH.UART_SERVICE_UUID,
          BLUETOOTH.READ_CHARACTERISTIC_UUID,
          Buffer.from(`*lint${logInterval}`, 'utf-8').toString('base64')
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  blink = async macAddress => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const device = await this.connectToDevice(macAddress, { scanMode: 2 });

        device.onDisconnected(() => reject());

        await device.discoverAllServicesAndCharacteristics();
        await this.manager.monitorCharacteristicForDevice(
          macAddress,
          BLUETOOTH.UART_SERVICE_UUID,
          BLUETOOTH.WRITE_CHARACTERISTIC_UUID,

          (_, result) => {
            if (result?.value) {
              const raw = Base64.decode(result.value);
              const rawLength = raw.length;
              const array = new Uint8Array(new ArrayBuffer(rawLength));

              for (let i = 0; i < rawLength; i += 1) array[i] = raw.charCodeAt(i);

              resolve(array);
              device.cancelConnection();
            }
          }
        );

        await this.manager.writeCharacteristicWithoutResponseForDevice(
          macAddress,
          BLUETOOTH.UART_SERVICE_UUID,
          BLUETOOTH.READ_CHARACTERISTIC_UUID,
          Buffer.from('*blink', 'utf-8').toString('base64')
        );
      } catch (e) {
        reject(e);
      }
    });
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
