import { getBatteryLevel, isBatteryCharging } from 'react-native-device-info';
import { check, request } from 'react-native-permissions';
import { BluetoothStatus } from 'react-native-bluetooth-status';

import { PERMISSION, PERMISSION_STATE, BLUETOOTH_STATE, DANGEROUS_BATTERY_LEVEL } from '~constants';

/**
 * This service object is a facade over multiple different native modules ...
 * ... which manage different device aspects: Permissions, the state of   ...
 * ... native features and OS controlled aspects like the battery level.
 *
 */
export class DeviceService {
  batteryLevel = async () => getBatteryLevel();

  isBatteryLevelDangerous = async () => {
    const batteryLevel = await this.batteryLevel();
    return batteryLevel < DANGEROUS_BATTERY_LEVEL;
  };

  isCharging = async () => isBatteryCharging();

  getBluetoothState = async () => BluetoothStatus.getState();

  isBluetoothEnabled = async () => {
    const bluetoothState = await this.getBluetoothState();
    return bluetoothState === BLUETOOTH_STATE.ON;
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
    const requestResult = await request(PERMISSION.STORAGE);
    return requestResult === PERMISSION_STATE.GRANTED;
  };
}
