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
} = {}) => {
  const { device, mockOnDisconnected } = createMockDevice();

  const mockDiscoverAllServicesAndCharacteristicsForDevice = jest.fn(() => {});
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

describe('BleService: sendCommand', () => {
  it('Returns the value the passed parser returns', async () => {
    const { manager } = createMockBleManager();
    const btService = new BleService(manager);

    const resultShouldBe = [];
    const parser = () => resultShouldBe;

    const result = await btService.sendCommand('josh', 'blink', parser);

    expect(result).toBe(resultShouldBe);
  });
  it('Calls connect and discover, then write and monitor', async () => {
    const {
      manager,
      mockConnectToDevice,
      mockDiscoverAllServicesAndCharacteristicsForDevice,
      mockMonitorCharacteristicForDevice,
      mockWriteCharacteristicWithoutResponseForDevice,
      mockCancelDeviceConnection,
    } = createMockBleManager();
    const btService = new BleService(manager);

    const macAddress = 'Josh';

    const parser = () => {};
    await btService.sendCommand(macAddress, 'blink', parser);

    expect(mockConnectToDevice).toBeCalledTimes(1);
    expect(mockConnectToDevice).toBeCalledWith(macAddress, { scanMode: 2 });

    expect(mockDiscoverAllServicesAndCharacteristicsForDevice).toBeCalledTimes(1);
    expect(mockDiscoverAllServicesAndCharacteristicsForDevice).toBeCalledWith(macAddress);

    expect(mockCancelDeviceConnection).toBeCalledTimes(0);
    expect(mockMonitorCharacteristicForDevice).toBeCalledTimes(1);
    expect(mockWriteCharacteristicWithoutResponseForDevice).toBeCalledTimes(1);
  });
});

describe('BleService: blink', () => {
  it('Returns whatever passed from the parser', async () => {
    const { manager } = createMockBleManager({
      mockMonitorCharacteristicForDeviceCallback: (_, __, ___, callback) => {
        callback(null, { value: 'josh' });
        callback(null, null);
      },
    });

    const btService = new BleService(manager);
    const result = await btService.blink('josh');
    expect(result).toEqual(false);
  });
});
