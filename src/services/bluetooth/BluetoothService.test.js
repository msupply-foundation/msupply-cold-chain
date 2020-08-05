import { BLUETOOTH_SERVICE_ERROR } from '~constants';
import { BluetoothService } from './BluetoothService';

function MockManager() {}
const mockData = [];
const getDevicesMock = jest.fn(async () => ({ success: true, data: mockData }));
const sendCommandMock = jest.fn(async () => ({ success: true }));

// Clear all mocks functions of their call trees
beforeEach(() => {
  jest.clearAllMocks();
  MockManager.prototype.getDevices = getDevicesMock;
  MockManager.prototype.sendCommand = sendCommandMock;
});

describe('BluetoothService: ManufacturerID', () => {
  it('is returned correctly', () => {
    const btService = new BluetoothService(new MockManager(), { manufacturerId: 1 });

    expect(btService.manufacturerId).toEqual(1);
  });
  it('throws an error when no manufacturerId is passed', () => {
    expect(() => new BluetoothService(new MockManager(), {})).toThrow(
      new Error(BLUETOOTH_SERVICE_ERROR.NO_MANUFACTURER_ID)
    );
  });
  it('returns the default when no config is passed', () => {
    const btService = new BluetoothService();
    expect(btService.manufacturerId).toBe(307);
  });
});

describe('BluetoothService: scanForDevices', () => {
  it("calls the correct methods on it's manager", async () => {
    const mockManager = new MockManager();
    const btService = new BluetoothService(mockManager);

    await btService.scanForDevices();

    expect(getDevicesMock).toHaveBeenCalledTimes(1);
  });
  it('is called with the correct parameters', async () => {
    const mockManager = new MockManager();
    let btService = new BluetoothService(mockManager);
    await btService.scanForDevices();

    btService = new BluetoothService(mockManager, { manufacturerId: 1 });
    await btService.scanForDevices();

    expect(getDevicesMock).toHaveBeenNthCalledWith(1, 307, '');
    expect(getDevicesMock).toHaveBeenNthCalledWith(2, 1, '');
  });
  it('returns the correct data on success', async () => {
    const mockManager = new MockManager();
    const btService = new BluetoothService(mockManager);
    const result = await btService.scanForDevices();

    expect(result).toEqual(mockData);
  });
  it('returns the correct data on success', async () => {
    let temporaryMockData = [];
    MockManager.prototype.getDevices = () => ({ success: true, data: temporaryMockData });

    let mockManager = new MockManager();
    let btService = new BluetoothService(mockManager);
    let result = await btService.scanForDevices();

    expect(result).toBe(temporaryMockData);

    temporaryMockData = [1, 2, 3];
    MockManager.prototype.getDevices = () => ({ success: true, data: temporaryMockData });

    mockManager = new MockManager();
    btService = new BluetoothService(mockManager);
    result = await btService.scanForDevices();

    expect(result).toBe(temporaryMockData);
  });
  it('throws when unsuccessful', async () => {
    const mockManager = new MockManager();
    const error = { errorCode: 'ERROR' };
    MockManager.prototype.getDevices = () => ({ success: false, error });
    const btService = new BluetoothService(mockManager);

    return expect(btService.scanForDevices).rejects.toBe(error);
  });
  it('throws when no manufacturer id is set', async () => {
    const mockManager = new MockManager();

    const btService = new BluetoothService(mockManager);
    btService.config.manufacturerId = '1';

    return expect(btService.scanForDevices).rejects.toEqual(
      new Error(BLUETOOTH_SERVICE_ERROR.NO_MANUFACTURER_ID_SET)
    );
  });
});

describe('BluetoothService: sendCommand', () => {
  it('returns a basic success object on a simple call', async () => {
    const btService = new BluetoothService(new MockManager());
    const result = await btService.sendCommand('DB:56:07:61:C7:13', '*blink');

    expect(result).toEqual({ success: true });
  });
  it('returns a basic false success object on failure call', async () => {
    MockManager.prototype.sendCommand = () => ({ success: false, error: {} });
    const btService = new BluetoothService(new MockManager());
    const result = await btService.sendCommand('DB:56:07:61:C7:13', '*blink');

    expect(result).toEqual({ success: false, error: {} });
  });
  it('calls the correct manager functions on a simple call', async () => {
    let btService = new BluetoothService(new MockManager());
    await btService.sendCommand('DB:56:07:61:C7:13', '*blink');

    expect(sendCommandMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toHaveBeenNthCalledWith(1, 307, 'DB:56:07:61:C7:13', '*blink');

    btService = new BluetoothService(new MockManager(), { manufacturerId: 1 });
    await btService.sendCommand('DB:56:07:61:C7:13', '*blink');

    expect(sendCommandMock).toHaveBeenCalledTimes(2);
    expect(sendCommandMock).toHaveBeenNthCalledWith(2, 1, 'DB:56:07:61:C7:13', '*blink');
  });

  it('throws when no command is passed', () => {
    const btService = new BluetoothService(new MockManager());

    return expect(async () => btService.sendCommand('DB:56:07:61:C7:13')).rejects.toThrowError(
      new Error(BLUETOOTH_SERVICE_ERROR.NO_COMMAND)
    );
  });
  it('throws when invalid command is passed', () => {
    const btService = new BluetoothService(new MockManager());

    return expect(async () => btService.sendCommand('DB:56:07:61:C7:13', 1)).rejects.toThrowError(
      new Error(BLUETOOTH_SERVICE_ERROR.NO_COMMAND)
    );
  });
  it('throws when no mac address is passed', () => {
    const btService = new BluetoothService(new MockManager());

    return expect(async () => btService.sendCommand()).rejects.toThrowError(
      new Error(BLUETOOTH_SERVICE_ERROR.NO_MAC_ADDRESS)
    );
  });
  it('throws when invalid mac address is passed', () => {
    const btService = new BluetoothService(new MockManager());

    return expect(async () => btService.sendCommand(1)).rejects.toThrowError(
      new Error(BLUETOOTH_SERVICE_ERROR.NO_MAC_ADDRESS)
    );
  });
  it('throws when no manufacturer id is set', () => {
    const btService = new BluetoothService(new MockManager());
    btService.config = {};

    return expect(async () =>
      btService.sendCommand('DB:56:07:61:C7:13', '*blink')
    ).rejects.toThrowError(new Error(BLUETOOTH_SERVICE_ERROR.NO_MANUFACTURER_ID_SET));
  });
  it('throws when invalid manufacturer id is set', () => {
    const btService = new BluetoothService(new MockManager());
    btService.config = { manufacturerId: '' };

    return expect(async () =>
      btService.sendCommand('DB:56:07:61:C7:13', '*blink')
    ).rejects.toThrowError(new Error(BLUETOOTH_SERVICE_ERROR.NO_MANUFACTURER_ID_SET));
  });
});

describe('BluetoothService: blinkSensor', () => {
  it('returns a success indicator boolean on a simple call', async () => {
    const btService = new BluetoothService(new MockManager());
    const result = await btService.blinkSensor('DB:56:07:61:C7:13');
    return expect(result).toEqual(true);
  });
  it('throws when not successful', async () => {
    MockManager.prototype.sendCommand = async () => ({ success: false, error: {} });
    const btService = new BluetoothService(new MockManager());

    return expect(async () => btService.blinkSensor('DB:56:07:61:C7:13')).rejects.toThrow();
  });
});

describe('BluetoothService: downloadLogs', () => {
  it('returns a simple data object when successful', async () => {
    const mockLogsData = [{ logs: [] }];
    MockManager.prototype.sendCommand = async () => ({ success: true, data: mockLogsData });

    const btService = new BluetoothService(new MockManager());
    const result = await btService.downloadLogs('DB:56:07:61:C7:13');

    return expect(result).toBe(mockLogsData[0].logs);
  });
  it('throws when unsuccessful', async () => {
    MockManager.prototype.sendCommand = async () => ({ success: false });

    const btService = new BluetoothService(new MockManager());

    return expect(async () => btService.downloadLogs('DB:56:07:61:C7:13')).rejects.toThrow();
  });
  it('throws when successful but has no logs', async () => {
    MockManager.prototype.sendCommand = async () => ({ success: false });

    const btService = new BluetoothService(new MockManager());
    MockManager.prototype.sendCommand = () => ({ success: true });

    return expect(async () => btService.downloadLogs('DB:56:07:61:C7:13')).rejects.toThrow();
  });
});

describe('BluetoothService: setLogInterval', () => {
  it('returns a simple boolean indicator when successful', async () => {
    const btService = new BluetoothService(new MockManager());
    const result = await btService.setLogInterval('DB:56:07:61:C7:13');
    return expect(result).toBe(true);
  });
  it('throws an error when unsuccessful', async () => {
    MockManager.prototype.sendCommand = async () => ({ success: false });
    const btService = new BluetoothService(new MockManager());
    return expect(async () => btService.setLogInterval('DB:56:07:61:C7:13', 300)).rejects.toThrow();
  });
  it('throws an error when an invalid interval is passed', async () => {
    const btService = new BluetoothService(new MockManager());
    await expect(async () => btService.setLogInterval('DB:56:07:61:C7:13', 1)).rejects.toThrow();
    await expect(async () => btService.setLogInterval('DB:56:07:61:C7:13', '')).rejects.toThrow();
  });
});

describe('BluetoothService: setAdvertisementInterval', () => {
  it('returns a simple boolean indicator when successful', async () => {
    const btService = new BluetoothService(new MockManager());
    const result = await btService.setAdvertisementInterval('DB:56:07:61:C7:13');
    return expect(result).toBe(true);
  });
  it('throws an error when unsuccessful', async () => {
    MockManager.prototype.sendCommand = async () => ({ success: false });
    const btService = new BluetoothService(new MockManager());
    return expect(async () =>
      btService.setAdvertisementInterval('DB:56:07:61:C7:13', 300)
    ).rejects.toThrow();
  });
  it('throws an error when an invalid interval is passed', async () => {
    const btService = new BluetoothService(new MockManager());

    await expect(async () =>
      btService.setAdvertisementInterval('DB:56:07:61:C7:13', '')
    ).rejects.toThrow();
    await expect(async () =>
      btService.setAdvertisementInterval('DB:56:07:61:C7:13', 1)
    ).rejects.toThrow();
  });
});
