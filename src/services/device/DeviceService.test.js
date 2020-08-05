import { DeviceService } from './DeviceService';

describe('Device Service: Battery level', () => {
  it('Returns the correct battery level', () => {
    const deviceService = new DeviceService();
    return expect(deviceService.batteryLevel()).resolves.toEqual(15);
  });
  it('Correctly evaluates battery level as dangerous', () => {
    const deviceService = new DeviceService();
    return expect(deviceService.isBatteryLevelDangerous()).resolves.toEqual(true);
  });
  it('Correctly returns if the device is charging or not', () => {
    const deviceService = new DeviceService();
    return expect(deviceService.isCharging()).resolves.toEqual(false);
  });
});

describe('Device Service: Bluetooth state', () => {
  it('Correctly returns the bluetooth state', () => {
    const deviceService = new DeviceService();

    return expect(deviceService.isBluetoothEnabled()).resolves.toEqual(true);
  });
});

describe('Device Service: Location permission handling', () => {
  it('Correctly returns the location permission state', () => {
    const deviceService = new DeviceService();

    return expect(deviceService.checkLocationPermission()).resolves.toEqual('granted');
  });
  it('Correctly returns the location permission state', () => {
    const deviceService = new DeviceService();

    return expect(deviceService.hasLocationPermission()).resolves.toEqual(true);
  });
  it('Correctly returns the return from a location permission request', () => {
    const deviceService = new DeviceService();

    return expect(deviceService.requestLocationPermission()).resolves.toEqual(true);
  });
});

describe('Device Service: Storage permission handling', () => {
  it('Correctly returns the storage permission state', () => {
    const deviceService = new DeviceService();

    return expect(deviceService.checkStoragePermission()).resolves.toEqual('granted');
  });
  it('Correctly returns the location permission state', () => {
    const deviceService = new DeviceService();

    return expect(deviceService.hasStoragePermission()).resolves.toEqual(true);
  });
  it('Correctly returns the result from a storage permission request', () => {
    const deviceService = new DeviceService();
    return expect(deviceService.requestStoragePermission()).resolves.toEqual(true);
  });
});
