import { BleService } from '~common/services';
import { BLUETOOTH } from '~constants';

const createMockDevice = () => {
  const mockOnDisconnected = jest.fn(callback => {
    callback();
  });
  const mockDiscoverAllServicesAndCharacteristics = jest.fn();

  return {
    device: {
      discoverAllServicesAndCharacteristics: mockDiscoverAllServicesAndCharacteristics,
    },
    mockOnDisconnected,
    mockDiscoverAllServicesAndCharacteristics,
  };
};

const createMockBleManager = ({
  isDeviceConnected = false,
  mockMonitorCharacteristicForDeviceCallback = (_, __, ___, callback) => callback(null),
  mockDiscoverAllServicesAndCharacteristicsForDeviceCallback = () => {},
} = {}) => {
  const { device, mockOnDisconnected } = createMockDevice();

  const mockDiscoverAllServicesAndCharacteristicsForDevice = jest.fn(
    mockDiscoverAllServicesAndCharacteristicsForDeviceCallback
  );
  const mockCancelDeviceConnection = jest.fn(async () => {});
  const mockIsDeviceConnected = jest.fn(async () => isDeviceConnected);
  const mockWriteCharacteristicWithoutResponseForDevice = jest.fn();
  const mockMonitorCharacteristicForDevice = jest.fn(mockMonitorCharacteristicForDeviceCallback);
  const mockConnectToDevice = jest.fn(() => device);
  const mockStopDeviceScan = jest.fn();
  const mockStartDeviceScan = jest.fn((_, __, ____, callback) => {
    callback({ manufacturerData: 'MwEBDAN0AFkBtwEMA3QAWQG3AMwCrAAAAAAA', id: '1' });
  });

  const manager = {
    discoverAllServicesAndCharacteristicsForDevice: mockDiscoverAllServicesAndCharacteristicsForDevice,
    cancelDeviceConnection: mockCancelDeviceConnection,
    connectToDevice: mockConnectToDevice,
    stopDeviceScan: mockStopDeviceScan,
    startDeviceScan: mockStartDeviceScan,
    monitorCharacteristicForDevice: mockMonitorCharacteristicForDevice,
    writeCharacteristicWithoutResponseForDevice: mockWriteCharacteristicWithoutResponseForDevice,
    isDeviceConnected: mockIsDeviceConnected,
  };

  return {
    manager,
    device,
    mockOnDisconnected,
    mockConnectToDevice,
    mockStopDeviceScan,
    mockStartDeviceScan,
    mockMonitorCharacteristicForDevice,
    mockWriteCharacteristicWithoutResponseForDevice,
    mockCancelDeviceConnection,
    mockDiscoverAllServicesAndCharacteristicsForDevice,
  };
};

describe('BleService: connectToDevice', () => {
  it('Calls to connect to a device with the mac address passed', async () => {
    const { manager, mockConnectToDevice } = createMockBleManager();
    const btService = new BleService(manager);

    const macAddress = 'Josh';

    btService.connectToDevice(macAddress);

    expect(mockConnectToDevice).toBeCalledTimes(1);
    expect(mockConnectToDevice).toBeCalledWith(macAddress, { scanMode: 2 });
  });
});

describe('BleService: writeCharacteristic', () => {
  it('Calls to connect to a device with the mac address passed', async () => {
    const { manager, mockConnectToDevice } = createMockBleManager();
    const btService = new BleService(manager);

    const macAddress = 'Josh';

    btService.connectToDevice(macAddress);

    expect(mockConnectToDevice).toBeCalledTimes(1);
    expect(mockConnectToDevice).toBeCalledWith(macAddress, { scanMode: 2 });
  });
});

describe('BleService: connectAndDiscoverServices', () => {
  it('Calls to connect to a device with the mac address passed', async () => {
    const {
      manager,
      mockConnectToDevice,
      mockDiscoverAllServicesAndCharacteristicsForDevice,
      mockCancelDeviceConnection,
    } = createMockBleManager();
    const btService = new BleService(manager);

    const macAddress = 'Josh';

    await btService.connectAndDiscoverServices(macAddress);

    expect(mockConnectToDevice).toBeCalledTimes(1);
    expect(mockConnectToDevice).toBeCalledWith(macAddress, { scanMode: 2 });

    expect(mockDiscoverAllServicesAndCharacteristicsForDevice).toBeCalledTimes(1);
    expect(mockDiscoverAllServicesAndCharacteristicsForDevice).toBeCalledWith(macAddress);

    expect(mockCancelDeviceConnection).toBeCalledTimes(0);
  });
  it('Disconnects from a sensor first, before trying to connect, if it was connected', async () => {
    const { manager, mockCancelDeviceConnection } = createMockBleManager({
      isDeviceConnected: true,
    });
    const btService = new BleService(manager);

    const macAddress = 'Josh';

    await btService.connectAndDiscoverServices(macAddress);

    expect(mockCancelDeviceConnection).toBeCalledTimes(1);
    expect(mockCancelDeviceConnection).toBeCalledWith(macAddress);
  });
});

describe('BleService: stopScan', () => {
  it('Correctly stops the scan through the provided manager', () => {
    const { manager, mockStopDeviceScan } = createMockBleManager();

    const btService = new BleService(manager);

    btService.stopScan();

    expect(mockStopDeviceScan).toBeCalledTimes(1);
    expect(mockStopDeviceScan).toBeCalledWith();
  });
});

describe('BleService: scanForSensors', () => {
  it('Correctly starts a scan for sensors through the passed manager', () => {
    const { manager, mockStartDeviceScan } = createMockBleManager();

    const btService = new BleService(manager);

    const callback = () => {};
    btService.scanForSensors(callback);

    expect(mockStartDeviceScan).toBeCalledTimes(1);
  });

  it('Correctly calls the callback passed', () => {
    const { manager } = createMockBleManager();
    const btService = new BleService(manager);

    const callback = jest.fn();
    btService.scanForSensors(callback);

    expect(callback).toBeCalledTimes(1);
    expect(callback).toBeCalledWith({
      manufacturerData: 'MwEBDAN0AFkBtwEMA3QAWQG3AMwCrAAAAAAA',
      id: '1',
    });
  });
});

describe('BleService: writeCharacteristic', () => {
  it('Writes a characteristic to the passed mac', async () => {
    const { manager, mockWriteCharacteristicWithoutResponseForDevice } = createMockBleManager();

    const bleService = new BleService(manager);

    await bleService.writeCharacteristic('josh', 'command');

    expect(mockWriteCharacteristicWithoutResponseForDevice).toBeCalledTimes(1);
    expect(mockWriteCharacteristicWithoutResponseForDevice).toBeCalledWith(
      'josh',
      BLUETOOTH.UART_SERVICE_UUID,
      BLUETOOTH.READ_CHARACTERISTIC_UUID,
      'Y29tbWFuZA=='
    );
  });
});

describe('BleService: monitorCharacteristic', () => {
  it('Calls monitor characteristic for device within the promise returned', async () => {
    const { manager, mockMonitorCharacteristicForDevice } = createMockBleManager();

    const bleService = new BleService(manager);

    const callback = (_, resolve) => resolve();
    await bleService.monitorCharacteristic('josh', callback);

    expect(mockMonitorCharacteristicForDevice).toBeCalledTimes(1);
  });
  it('Resolves with whatever value the callback passed resolves with', async () => {
    const { manager } = createMockBleManager();

    const bleService = new BleService(manager);

    const callback = (_, resolve) => resolve('value');

    await expect(bleService.monitorCharacteristic('josh', callback)).resolves.toEqual('value');
  });
});

describe('BleService: writeAndMonitor', () => {
  it('Calls the callback passed', async () => {
    const { manager } = createMockBleManager();
    const btService = new BleService(manager);

    const callback = jest.fn();
    await btService.writeAndMonitor('josh', 'blink', callback);

    expect(callback).toBeCalledTimes(1);
  });
  it('Resolves to the value the passed callback resolves', async () => {
    const { manager } = createMockBleManager();
    const btService = new BleService(manager);

    const dataReturned = [];
    const callback = () => dataReturned;
    const result = await btService.writeAndMonitor('josh', 'blink', callback);

    expect(result).toBe(dataReturned);
  });
});

describe('BleService: writeWithSingleResponse', () => {
  it('Returns the value the passed parser returns', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T2sA' });
      },
    });
    const btService = new BleService(manager);

    const resultShouldBe = [];
    const parser = () => resultShouldBe;

    const result = await btService.writeWithSingleResponse('josh', 'blink', parser);

    expect(result).toBe(resultShouldBe);
  });
  it('Calls connect and discover, then write and monitor', async () => {
    const {
      manager,
      mockMonitorCharacteristicForDevice,
      mockWriteCharacteristicWithoutResponseForDevice,
      mockCancelDeviceConnection,
    } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T2sA' });
      },
    });
    const btService = new BleService(manager);

    const macAddress = 'Josh';

    const parser = () => {};
    await btService.writeWithSingleResponse(macAddress, 'blink', parser);

    expect(mockCancelDeviceConnection).toBeCalledTimes(0);
    expect(mockMonitorCharacteristicForDevice).toBeCalledTimes(1);
    expect(mockWriteCharacteristicWithoutResponseForDevice).toBeCalledTimes(1);
  });
});

describe('BleService: blink', () => {
  it('Returns true when receiving an OK response', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T2sA' });
      },
    });

    const btService = new BleService(manager);
    const result = await btService.blink('josh');
    expect(result).toEqual(true);
  });
});

describe('BleService: updateLogInterval', () => {
  it('Returns true when receiving an OK response', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'SW50ZXJ2YWw6IDYwcwAAAAAAAAA=' });
      },
    });

    const btService = new BleService(manager);
    const result = await btService.updateLogInterval('josh', 60);
    expect(result).toMatch(/Interval: 60s/);
  });
});

describe('BleService: toggleButton', () => {
  it('Returns true when receiving an OK response', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T0sA=' });
      },
    });

    const btService = new BleService(manager);
    const result = await btService.toggleButton('josh');
    expect(result).toEqual(true);
  });
});

describe('BleService: downloadLogs', () => {
  it('Returns parsed logs', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'ABEAEQARAAIBAAAAAAA6' });
        callback(null, { value: 'ARcBFwEXARcBFwEXARcBFwEXARc=' });
        callback(null, { value: 'ARcBFwEXARYBFgEWARguAAAAAAA=' });
        callback(null, null);
      },
    });

    const btService = new BleService(manager);
    const result = await btService.downloadLogs('josh');
    expect(result).toEqual([
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.8 },
      { temperature: 27.8 },
      { temperature: 27.8 },
      { temperature: 28 },
    ]);
  });
});

describe('BleService: getInfo', () => {
  it('Returns true when receiving an OK response', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'U0VUVElOR1MAAAAAAAAAAAAAAAA=' });
        callback(null, { value: 'TmFtZTogICBFNzIyOTZERQAAAAA=' });
        callback(null, { value: 'VmVyIG5vOiAxMwAAAAAAAAAAAAA=' });
        callback(null, { value: 'U3ViIHZlciBubzogMTUuMC4wAAA=' });
        callback(null, { value: 'UmVsIGR0ZTogMjYgU2VwIDE5AAA=' });
        callback(null, { value: 'VHhwIGx2bDogNAAAAAAAAAAAAAA=' });
        callback(null, { value: 'QmF0dCBsdmw6IDEwMCUAAAAAAAA=' });
        callback(null, { value: 'TWVtIDgzMyBkYXlzAAAAAAAAAAA=' });
        callback(null, { value: 'QWR2IHdrZXVwOiBOL0EAAAAAAAA=' });
        callback(null, { value: 'VW5pdHM6IEMAAAAAAAAAAAAAAAA=' });
        callback(null, { value: 'TWVtOiAyMDAwMAAAAAAAAAAAAAA=' });
        callback(null, { value: 'QWlyIG1vZGUgb2ZmAAAAAAAAAAA=' });
        callback(null, { value: 'UnVuIGFwcHggMTZocnMAAAAAAAA=' });
        callback(null, { value: 'RGF0ZSB5eW1tZGRoaG1tOgAAAAA=' });
        callback(null, { value: 'LT4gMDA6MDA6MDA6MDA6MDAAAAA=' });
        callback(null, { value: 'SWQ6IDI1NQAAAAAAAAAAAAAAAAA=' });
        callback(null, { value: 'QnRuIG9uL29mZjogMQAAAAAAAAA=' });
        callback(null, { value: 'VGVtcCBDYWwuIDAAAAAAAAAAAAA=' });
        callback(null, { value: 'SHVtIENhbHgxMCAwJQAAAAAAAAA=' });
        callback(null, null);
      },
    });

    const btService = new BleService(manager);
    const result = await btService.getInfo('josh');
    expect(result).toEqual({ batteryLevel: '100', isDisabled: true });
  });
});

describe('BleService: getInfoWithRetries', () => {
  it('Retries after an error is thrown', async () => {
    let retries = 0;
    const {
      manager,
      mockConnectToDevice,
      mockWriteCharacteristicWithoutResponseForDevice,
      mockMonitorCharacteristicForDevice,
    } = createMockBleManager({
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        if (retries < 3) {
          retries += 1;
          throw new Error();
        }
      },
    });

    const btService = new BleService(manager);
    await btService.getInfoWithRetries('josh', 10);

    expect(mockConnectToDevice).toBeCalledTimes(4);
    expect(mockWriteCharacteristicWithoutResponseForDevice).toBeCalledTimes(1);
    expect(mockMonitorCharacteristicForDevice).toBeCalledTimes(1);
  });
  it('retries a maximum of 10 times', async () => {
    const { manager, mockConnectToDevice } = createMockBleManager({
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        throw new Error();
      },
    });

    expect.assertions(1);
    const btService = new BleService(manager);
    try {
      await btService.getInfoWithRetries('josh', 10);
    } catch (e) {
      expect(mockConnectToDevice).toBeCalledTimes(10);
    }
  });
  it('Returns a correct value', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'U0VUVElOR1MAAAAAAAAAAAAAAAA=' });
        callback(null, { value: 'TmFtZTogICBFNzIyOTZERQAAAAA=' });
        callback(null, { value: 'VmVyIG5vOiAxMwAAAAAAAAAAAAA=' });
        callback(null, { value: 'U3ViIHZlciBubzogMTUuMC4wAAA=' });
        callback(null, { value: 'UmVsIGR0ZTogMjYgU2VwIDE5AAA=' });
        callback(null, { value: 'VHhwIGx2bDogNAAAAAAAAAAAAAA=' });
        callback(null, { value: 'QmF0dCBsdmw6IDEwMCUAAAAAAAA=' });
        callback(null, { value: 'TWVtIDgzMyBkYXlzAAAAAAAAAAA=' });
        callback(null, { value: 'QWR2IHdrZXVwOiBOL0EAAAAAAAA=' });
        callback(null, { value: 'VW5pdHM6IEMAAAAAAAAAAAAAAAA=' });
        callback(null, { value: 'TWVtOiAyMDAwMAAAAAAAAAAAAAA=' });
        callback(null, { value: 'QWlyIG1vZGUgb2ZmAAAAAAAAAAA=' });
        callback(null, { value: 'UnVuIGFwcHggMTZocnMAAAAAAAA=' });
        callback(null, { value: 'RGF0ZSB5eW1tZGRoaG1tOgAAAAA=' });
        callback(null, { value: 'LT4gMDA6MDA6MDA6MDA6MDAAAAA=' });
        callback(null, { value: 'SWQ6IDI1NQAAAAAAAAAAAAAAAAA=' });
        callback(null, { value: 'QnRuIG9uL29mZjogMQAAAAAAAAA=' });
        callback(null, { value: 'VGVtcCBDYWwuIDAAAAAAAAAAAAA=' });
        callback(null, { value: 'SHVtIENhbHgxMCAwJQAAAAAAAAA=' });
        callback(null, null);
      },
    });

    const btService = new BleService(manager);
    const result = await btService.getInfoWithRetries('josh', 10);
    expect(result).toEqual({ batteryLevel: '100', isDisabled: true });
  });
});

describe('BleService: updateLogIntervalWithRetries', () => {
  it('Retries after an error is thrown', async () => {
    let retries = 0;
    const {
      manager,
      mockConnectToDevice,
      mockWriteCharacteristicWithoutResponseForDevice,
      mockMonitorCharacteristicForDevice,
    } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'SW50ZXJ2YWw6IDYwcwAAAAAAAAA=' });
      },
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        if (retries < 3) {
          retries += 1;
          throw new Error();
        }
      },
    });

    const btService = new BleService(manager);
    await btService.updateLogIntervalWithRetries('josh', 60, 10);

    expect(mockConnectToDevice).toBeCalledTimes(4);
    expect(mockWriteCharacteristicWithoutResponseForDevice).toBeCalledTimes(1);
    expect(mockMonitorCharacteristicForDevice).toBeCalledTimes(1);
  });
  it('retries a maximum of 10 times', async () => {
    const { manager, mockConnectToDevice } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'SW50ZXJ2YWw6IDYwcwAAAAAAAAA=' });
      },
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        throw new Error();
      },
    });

    expect.assertions(1);
    const btService = new BleService(manager);
    try {
      await btService.updateLogIntervalWithRetries('josh', 10, 10);
    } catch (e) {
      expect(mockConnectToDevice).toBeCalledTimes(10);
    }
  });
  it('Returns a correct value', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'SW50ZXJ2YWw6IDYwcwAAAAAAAAA=' });
      },
    });

    const btService = new BleService(manager);
    const result = await btService.updateLogIntervalWithRetries('josh', 60, 10);
    expect(result).toMatch(/Interval: 60s/);
  });
});

describe('BleService: blinkWithRetries', () => {
  it('Retries after an error is thrown', async () => {
    let retries = 0;
    const {
      manager,
      mockConnectToDevice,
      mockWriteCharacteristicWithoutResponseForDevice,
      mockMonitorCharacteristicForDevice,
    } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T2sA' });
      },
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        if (retries < 3) {
          retries += 1;
          throw new Error();
        }
      },
    });

    const btService = new BleService(manager);
    await btService.blinkWithRetries('josh', 10);

    expect(mockConnectToDevice).toBeCalledTimes(4);
    expect(mockWriteCharacteristicWithoutResponseForDevice).toBeCalledTimes(1);
    expect(mockMonitorCharacteristicForDevice).toBeCalledTimes(1);
  });
  it('retries a maximum of 10 times', async () => {
    const { manager, mockConnectToDevice } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T2sA' });
      },
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        throw new Error();
      },
    });

    expect.assertions(1);
    const btService = new BleService(manager);
    try {
      await btService.blinkWithRetries('josh', 10);
    } catch (e) {
      expect(mockConnectToDevice).toBeCalledTimes(10);
    }
  });
  it('Returns a correct value', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T2sA' });
      },
    });

    const btService = new BleService(manager);
    const result = await btService.blinkWithRetries('josh', 10);
    expect(result).toEqual(true);
  });
});

describe('BleService: toggleButtonWithRetries', () => {
  it('Retries after an error is thrown', async () => {
    let retries = 0;
    const {
      manager,
      mockConnectToDevice,
      mockWriteCharacteristicWithoutResponseForDevice,
      mockMonitorCharacteristicForDevice,
    } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T2sA' });
      },
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        if (retries < 3) {
          retries += 1;
          throw new Error();
        }
      },
    });

    const btService = new BleService(manager);
    await btService.toggleButtonWithRetries('josh', 10);

    expect(mockConnectToDevice).toBeCalledTimes(4);
    expect(mockWriteCharacteristicWithoutResponseForDevice).toBeCalledTimes(1);
    expect(mockMonitorCharacteristicForDevice).toBeCalledTimes(1);
  });
  it('retries a maximum of 10 times', async () => {
    const { manager, mockConnectToDevice } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T2sA' });
      },
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        throw new Error();
      },
    });

    expect.assertions(1);
    const btService = new BleService(manager);
    try {
      await btService.toggleButtonWithRetries('josh', 10);
    } catch (e) {
      expect(mockConnectToDevice).toBeCalledTimes(10);
    }
  });
  it('Returns a correct value', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'T2sA' });
      },
    });

    const btService = new BleService(manager);
    const result = await btService.toggleButtonWithRetries('josh', 10);
    expect(result).toEqual(true);
  });
});

describe('BleService: downloadLogsWithRetries', () => {
  it('Retries after an error is thrown', async () => {
    let retries = 0;
    const {
      manager,
      mockConnectToDevice,
      mockWriteCharacteristicWithoutResponseForDevice,
      mockMonitorCharacteristicForDevice,
    } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'x' });
      },
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        if (retries < 3) {
          retries += 1;
          throw new Error();
        }
      },
    });

    const btService = new BleService(manager);
    await btService.toggleButtonWithRetries('josh', 10);

    expect(mockConnectToDevice).toBeCalledTimes(4);
    expect(mockWriteCharacteristicWithoutResponseForDevice).toBeCalledTimes(1);
    expect(mockMonitorCharacteristicForDevice).toBeCalledTimes(1);
  });
  it('retries a maximum of 10 times', async () => {
    const { manager, mockConnectToDevice } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: '' });
      },
      mockDiscoverAllServicesAndCharacteristicsForDeviceCallback: () => {
        throw new Error();
      },
    });

    expect.assertions(1);
    const btService = new BleService(manager);
    try {
      await btService.downloadLogsWithRetries('josh', 10);
    } catch (e) {
      expect(mockConnectToDevice).toBeCalledTimes(10);
    }
  });
  it('Returns a correct value', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'ABEAEQARAAIBAAAAAAA6' });
        callback(null, { value: 'ARcBFwEXARcBFwEXARcBFwEXARc=' });
        callback(null, { value: 'ARcBFwEXARYBFgEWARguAAAAAAA=' });
        callback(null, null);
      },
    });

    const btService = new BleService(manager);
    const result = await btService.downloadLogsWithRetries('josh', 10);
    expect(result).toEqual([
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.9 },
      { temperature: 27.8 },
      { temperature: 27.8 },
      { temperature: 27.8 },
      { temperature: 28 },
    ]);
  });
});
