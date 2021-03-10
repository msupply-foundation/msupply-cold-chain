/* eslint-disable no-empty */
import { Alert } from 'react-native';
import SystemSetting from 'react-native-system-setting';
import DeviceInfo from 'react-native-device-info';
import * as Permissions from 'react-native-permissions';
import * as RNLocalize from 'react-native-localize';
import { PERMISSION, PERMISSION_STATE } from '../../constants';

/**
 * This service object is a facade over multiple different native modules
 * which manage different device aspects: Permissions, the state of
 * native features and OS controlled aspects like the battery level.
 *
 */
export class PermissionService {
  settings: typeof SystemSetting;

  permissions: typeof Permissions;

  deviceInfo: typeof DeviceInfo;

  localizeInfo: typeof RNLocalize;

  alerter: typeof Alert;

  constructor(
    settings = SystemSetting,
    permissions = Permissions,
    deviceInfo = DeviceInfo,
    localizeInfo = RNLocalize,
    alerter = Alert
  ) {
    this.settings = settings;
    this.permissions = permissions;
    this.deviceInfo = deviceInfo;
    this.localizeInfo = localizeInfo;
    this.alerter = alerter;
  }

  checkBluetoothStatus = async (): Promise<boolean> => {
    return this.settings.isBluetoothEnabled();
  };

  requestBluetoothEnabled = async (): Promise<boolean> => {
    const isBluetoothEnabled = await this.checkBluetoothStatus();
    if (isBluetoothEnabled) return true;

    await this.settings.switchBluetooth();
    return this.checkBluetoothStatus();
  };

  hasLocationPermission = async (): Promise<boolean> => {
    const checkResult = await this.permissions.check(PERMISSION.LOCATION);
    return checkResult === PERMISSION_STATE.GRANTED;
  };

  requestLocationPermission = async (): Promise<boolean> => {
    const requestResult = await this.permissions.request(PERMISSION.LOCATION);
    return requestResult === PERMISSION_STATE.GRANTED;
  };

  hasStoragePermission = async (): Promise<boolean> => {
    const checkResult = await this.permissions.check(PERMISSION.STORAGE);
    return checkResult === PERMISSION_STATE.GRANTED;
  };

  requestStoragePermission = async (): Promise<boolean> => {
    const requestResult = await this.permissions.request(PERMISSION.STORAGE, '');
    return requestResult === PERMISSION_STATE.GRANTED;
  };

  checkLocationServicesStatus = async (): Promise<boolean> => {
    return this.settings.isLocationEnabled();
  };

  requestLocationServicesEnabled = async (): Promise<boolean> => {
    const isEnabled = await this.checkLocationServicesStatus();

    return new Promise(resolve => {
      if (isEnabled) return resolve(true);

      return this.alerter.alert(
        'Location Services',
        'Please enable location services to allow the use of bluetooth.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await this.settings.switchLocation();
              const result = await this.checkLocationServicesStatus();
              resolve(result);
            },
          },
        ],
        { cancelable: false }
      );
    });
  };

  addFeatureStatusListener = async (
    feature: 'location' | 'bluetooth',
    callback: (newStatus: boolean) => void
  ): Promise<void> => {
    switch (feature) {
      default: {
        return;
      }
      case 'location': {
        this.settings.addLocationModeListener((newStatus: number) => callback(newStatus !== 0));
        return;
      }
      case 'bluetooth': {
        this.settings.addBluetoothListener((newStatus: boolean) => callback(newStatus));
      }
    }
  };

  getDeviceModel = (): string => {
    return this.deviceInfo.getModel();
  };

  getDeviceTimezone = (): string => {
    return this.localizeInfo.getTimeZone();
  };
}
