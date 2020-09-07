import { getBatteryLevel, isBatteryCharging } from 'react-native-device-info';
import { check, request } from 'react-native-permissions';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import RNFS from 'react-native-fs';
import moment from 'moment';
import { Parser } from 'json2csv';
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

  enableBluetooth = async () => {
    return BluetoothStatus.enable();
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

  writeLogFile = async logs => {
    const fields = ['timestamp', 'temperature', 'single exposure'];
    const withSingleExposure = obj => ({ ...obj, 'single exposure': !!obj.temperatureBreachId });
    const opts = { fields, transforms: [withSingleExposure] };
    let csv;
    try {
      const parser = new Parser(opts);
      csv = parser.parse(logs);
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const directory = '/Download/cce';
    const now = moment().format('DD-MM-YYYY-HHmm');
    const file = `/${now}.csv`;
    await this.requestStoragePermission();
    const path = `${RNFS.ExternalStorageDirectoryPath}${directory}${file}'`;

    try {
      await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}${directory}`);
      await RNFS.writeFile(path, csv, 'utf8');
      return path;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    return null;
  };
}
