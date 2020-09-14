/* eslint-disable no-empty */

import { Alert } from 'react-native';
import DeviceInfo, { getBatteryLevel, isBatteryCharging } from 'react-native-device-info';
import SystemSetting from 'react-native-system-setting';
import * as RNLocalize from 'react-native-localize';
import { check, request } from 'react-native-permissions';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import { PERMISSION, PERMISSION_STATE, DANGEROUS_BATTERY_LEVEL } from '~constants';

/**
 * This service object is a facade over multiple different native modules ...
 * ... which manage different device aspects: Permissions, the state of   ...
 * ... native features and OS controlled aspects like the battery level.
 *
 */
export class PermissionService {
  batteryLevel = async () => getBatteryLevel();

  isBatteryLevelDangerous = async () => {
    const batteryLevel = await this.batteryLevel();
    return batteryLevel < DANGEROUS_BATTERY_LEVEL;
  };

  isCharging = async () => isBatteryCharging();

  getBluetoothState = async () => BluetoothStatus.state();

  isBluetoothEnabled = async () => {
    return this.getBluetoothState();
  };

  checkBluetoothStatus = async () => {
    return this.getBluetoothState();
  };

  requestBluetoothEnabled = async () => {
    BluetoothStatus.enable();
    return this.getBluetoothState();
  };

  enableBluetooth = async () => {
    BluetoothStatus.enable();
    return this.getBluetoothState();
  };

  disableBluetooth = async () => {
    return BluetoothStatus.disable();
  };

  checkLocationPermission = async () => check(PERMISSION.LOCATION);

  hasLocationPermission = async () => {
    const checkResult = await this.checkLocationPermission();
    return checkResult === PERMISSION_STATE.GRANTED;
  };

  requestLocationPermission = async () => {
    const requestResult = await request(PERMISSION.LOCATION);
    return requestResult === PERMISSION_STATE.GRANTED;
  };

  checkStoragePermission = async () => check(PERMISSION.STORAGE);

  hasStoragePermission = async () => {
    const checkResult = await this.checkStoragePermission();
    return checkResult === PERMISSION_STATE.GRANTED;
  };

  requestStoragePermission = async () => {
    const requestResult = await request(PERMISSION.STORAGE, '');
    return requestResult === PERMISSION_STATE.GRANTED;
  };

  isLocationServicesEnabled = async () => {
    return SystemSetting.isLocationEnabled();
  };

  checkLocationServicesStatus = async () => {
    return SystemSetting.isLocationEnabled();
  };

  requestLocationServicesEnabled = async () => {
    const isEnabled = await this.isLocationServicesEnabled();
    // eslint-disable-next-line consistent-return
    return new Promise(resolve => {
      if (isEnabled) return resolve(true);
      Alert.alert(
        'Location Services',
        'Please enable location services to allow the use of bluetooth.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await SystemSetting.switchLocation(async () => {
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
        return SystemSetting.addLocationModeListener(newStatus => callback(newStatus !== 0));
      }
      case 'bluetooth': {
        return SystemSetting.addBluetoothListener(callback);
      }
    }
  };

  getDeviceModel = () => {
    return DeviceInfo.getModel();
  };

  getDeviceTimezone = () => {
    return RNLocalize.getTimeZone();
  };
}
