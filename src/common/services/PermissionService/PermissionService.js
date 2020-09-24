/* eslint-disable no-empty */

import { Alert } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import SystemSetting from 'react-native-system-setting';
import * as RNLocalize from 'react-native-localize';
import * as Permissions from 'react-native-permissions';

import { PERMISSION, PERMISSION_STATE } from '~constants';

/**
 * This service object is a facade over multiple different native modules ...
 * ... which manage different device aspects: Permissions, the state of   ...
 * ... native features and OS controlled aspects like the battery level.
 *
 */
export class PermissionService {
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

  checkBluetoothStatus = async () => {
    return this.settings.isBluetoothEnabled();
  };

  requestBluetoothEnabled = async () => {
    await this.settings.switchBluetooth();
    return this.checkBluetoothStatus();
  };

  hasLocationPermission = async () => {
    const checkResult = await this.permissions.check(PERMISSION.LOCATION);
    return checkResult === PERMISSION_STATE.GRANTED;
  };

  requestLocationPermission = async () => {
    const requestResult = await this.permissions.request(PERMISSION.LOCATION);
    return requestResult === PERMISSION_STATE.GRANTED;
  };

  hasStoragePermission = async () => {
    const checkResult = await this.permissions.check(PERMISSION.STORAGE);
    return checkResult === PERMISSION_STATE.GRANTED;
  };

  requestStoragePermission = async () => {
    const requestResult = await this.permissions.request(PERMISSION.STORAGE, '');
    return requestResult === PERMISSION_STATE.GRANTED;
  };

  checkLocationServicesStatus = async () => {
    return this.settings.isLocationEnabled();
  };

  requestLocationServicesEnabled = async () => {
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
              await this.settings.switchLocation(async () => {
                const result = await this.isLocationServicesEnabled();
                resolve(result);
              });
            },
          },
        ],
        { cancelable: false }
      );
    });
  };

  addFeatureStatusListener = async (feature, callback) => {
    switch (feature) {
      default: {
        return null;
      }
      case 'location': {
        return this.settings.addLocationModeListener(newStatus => callback(newStatus !== 0));
      }
      case 'bluetooth': {
        return this.settings.addBluetoothListener(callback);
      }
    }
  };

  getDeviceModel = () => {
    return this.deviceInfo.getModel();
  };

  getDeviceTimezone = () => {
    return this.localizeInfo.getTimeZone();
  };
}
