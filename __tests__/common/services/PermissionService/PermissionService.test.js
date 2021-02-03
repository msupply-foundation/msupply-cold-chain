import { PermissionService } from '~common/services';

describe('PermissionService: checkBluetoothStatus', () => {
  it('Returns true when bluetooth is enabled', () => {
    const permissionsService = new PermissionService();
    expect(permissionsService.checkBluetoothStatus()).resolves.toBe(true);
  });
});

describe('PermissionService: requestBluetoothEnabled', () => {
  it('Returns true when bluetooth is enabled', () => {
    const permissionsService = new PermissionService();
    expect(permissionsService.requestBluetoothEnabled()).resolves.toBe(true);
  });
  it('Returns true when bluetooth is enabled', () => {
    const settings = {
      isBluetoothEnabled: async () => false,
      switchBluetooth: async () => true,
    };
    const permissionsService = new PermissionService(settings);

    return expect(permissionsService.requestBluetoothEnabled()).resolves.toBe(false);
  });
});

describe('PermissionService: hasLocationPermission', () => {
  it('Returns true when bluetooth is enabled', () => {
    const permissionsService = new PermissionService();
    expect(permissionsService.hasLocationPermission()).resolves.toBe(true);
  });
});

describe('PermissionService: requestLocationPermission', () => {
  it('Returns true when bluetooth is enabled', () => {
    const permissionsService = new PermissionService();
    expect(permissionsService.requestLocationPermission()).resolves.toBe(true);
  });
});

describe('PermissionService: hasStoragePermission', () => {
  it('Returns true when bluetooth is enabled', () => {
    const permissionsService = new PermissionService();
    expect(permissionsService.hasStoragePermission()).resolves.toBe(true);
  });
});

describe('PermissionService: requestStoragePermission', () => {
  it('Returns true when bluetooth is enabled', () => {
    const permissionsService = new PermissionService();
    expect(permissionsService.requestStoragePermission()).resolves.toBe(true);
  });
});

describe('PermissionService: checkLocationServicesStatus', () => {
  it('Returns the state of location services', () => {
    const permissionsService = new PermissionService();
    expect(permissionsService.checkLocationServicesStatus()).resolves.toBe(true);
  });
});

describe('PermissionService: requestLocationServicesEnabled', () => {
  it('Returns a new state when requesting location services to be enabled', async () => {
    const permissionsService = new PermissionService();
    await expect(permissionsService.requestLocationServicesEnabled()).resolves.toBe(true);
  });
});

describe('PermissionService: getDeviceModel', () => {
  it('Returns a device model', () => {
    const permissionsService = new PermissionService();
    expect(permissionsService.getDeviceModel()).toBe('model');
  });
});

describe('PermissionService: getDeviceTimezone', () => {
  it('Returns a timezone', () => {
    const permissionsService = new PermissionService();
    expect(permissionsService.getDeviceTimezone()).toBe('Pacific/Auckland');
  });
});

describe('PermissionService: addFeatureStatusListener', () => {
  it('Calls the location callback with a new true state when added', async () => {
    const permissionsService = new PermissionService();
    const callback = jest.fn(() => {});
    permissionsService.addFeatureStatusListener('location', callback);

    expect(callback).toBeCalledTimes(1);
    expect(callback).toBeCalledWith(true);
  });
  it('Calls the bluetooth callback with a new true state when added', async () => {
    const permissionsService = new PermissionService();
    const callback = jest.fn(() => {});
    permissionsService.addFeatureStatusListener('bluetooth', callback);

    expect(callback).toBeCalledTimes(1);
    expect(callback).toBeCalledWith(true);
  });
});
