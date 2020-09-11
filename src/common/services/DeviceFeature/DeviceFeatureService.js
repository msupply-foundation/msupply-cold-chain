/* eslint-disable no-empty */

import { Alert } from 'react-native';
import DeviceInfo, { getBatteryLevel, isBatteryCharging } from 'react-native-device-info';
import Mailer from 'react-native-mail';
import SystemSetting from 'react-native-system-setting';
import * as RNLocalize from 'react-native-localize';
import { check, request } from 'react-native-permissions';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import RNFS from 'react-native-fs';
import moment from 'moment';
import { Parser } from 'json2csv';
import { PERMISSION, PERMISSION_STATE, DANGEROUS_BATTERY_LEVEL } from '~constants';

/**
 * This service object is a facade over multiple different native modules ...
 * ... which manage different device aspects: Permissions, the state of   ...
 * ... native features and OS controlled aspects like the battery level.
 *
 */
export class DeviceFeatureService {
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

  addFeatureListener = async (feature, callback) => {
    switch (feature) {
      default: {
        return null;
      }
      case 'location': {
        return SystemSetting.addLocationListener(callback);
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

  writeLogFile = async (
    sensor,
    sensorReport,
    sensorStats,
    logsReport,
    breachReport,
    breachConfigReport,
    username,
    comment
  ) => {
    let csv = '';

    const generalReportFields = [
      'Timezone',
      'Device',
      'Sensor Name',
      'Exported By',
      'Job description',
    ];
    const generalReport = {
      Timezone: this.getDeviceTimezone(),
      Device: this.getDeviceModel(),
      'Sensor Name': sensor.name ?? sensor.macAddress,
      'Exported By': username,
      'Job description': comment,
    };
    const generalReportParser = new Parser({ fields: generalReportFields });
    try {
      csv += `${generalReportParser.parse(generalReport)} \n\n`;
    } catch (e) {}

    const sensorReportFields = ['Programmed On', 'Logging Start', 'Logging Interval'];
    const sensorReportParser = new Parser(sensorReportFields);

    try {
      csv += `LAST PROGRAMMED\n${sensorReportParser.parse(sensorReport)}\n\n`;
    } catch (e) {}

    const breachConfigReportFields = [
      'Breach Type',
      'Breach Name',
      'Number of Minutes',
      'Temperature',
      'Direction',
    ];
    const breachConfigReportParser = new Parser(breachConfigReportFields);

    try {
      csv += `BREACH CONFIGURATIONS\n${breachConfigReportParser.parse(breachConfigReport)}\n\n`;
    } catch (e) {}

    const sensorStatsFields = [
      'Max Temperature',
      'Min Temperature',
      'Number of continuous breaches',
    ];
    const sensorStatsParser = new Parser({ fields: sensorStatsFields });

    try {
      csv += `STATISTICS\n${sensorStatsParser.parse(sensorStats)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const breachReportFields = [
      'Breach Type',
      'Breach Name',
      'Start',
      'End',
      'Exposure Duration (minutes)',
      'Min Temp',
      'Max Temp',
    ];
    const breachReportParser = new Parser({ fields: breachReportFields });
    try {
      csv += `BREACHES\n${breachReportParser.parse(breachReport)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const logReportFields = [
      'Timestamp',
      'Temperature',
      'Is cumulative breach',
      'Is continuous breach',
      'Logging Interval (Minutes)',
    ];

    const logReportParser = new Parser({ fields: logReportFields });

    try {
      csv += `LOGS\n${logReportParser.parse(logsReport)}`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const directory = '/Download/cce';
    const now = moment().format('DD-MM-YYYY-HHmm');
    const file = `/${now}.csv`;
    await this.requestStoragePermission();
    const path = `${RNFS.ExternalStorageDirectoryPath}${directory}${file}`;

    try {
      await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}${directory}`);
      await RNFS.writeFile(path, csv, 'utf8');
      return path;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    return null;
  };

  emailLogFile = async (
    sensor,
    sensorReport,
    sensorStats,
    logsReport,
    breachReport,
    breachConfigReport,
    username,
    comment
  ) => {
    let csv = '';

    const generalReportFields = [
      'Timezone',
      'Device',
      'Sensor Name',
      'Exported By',
      'Exported On',
      'Job description',
    ];
    const generalReport = {
      Timezone: this.getDeviceTimezone(),
      Device: this.getDeviceModel(),
      'Sensor Name': sensor.name ?? sensor.macAddress,
      'Exported By': username,
      'Exported On': moment().format('YYYY-MM-DD HH:mm:ss'),
      'Job description': comment,
    };
    const generalReportParser = new Parser({ fields: generalReportFields });
    try {
      csv += `${generalReportParser.parse(generalReport)} \n\n`;
    } catch (e) {}

    const sensorReportFields = ['Programmed On', 'Logging Start', 'Logging Interval'];
    const sensorReportParser = new Parser(sensorReportFields);

    try {
      csv += `LAST PROGRAMMED\n${sensorReportParser.parse(sensorReport)}\n\n`;
    } catch (e) {}

    const breachConfigReportFields = [
      'Breach Type',
      'Breach Name',
      'Number of Minutes',
      'Temperature',
      'Direction',
    ];
    const breachConfigReportParser = new Parser(breachConfigReportFields);

    try {
      csv += `BREACH CONFIGURATIONS\n${breachConfigReportParser.parse(breachConfigReport)}\n\n`;
    } catch (e) {}

    const sensorStatsFields = [
      'Max Temperature',
      'Min Temperature',
      'Number of continuous breaches',
    ];
    const sensorStatsParser = new Parser({ fields: sensorStatsFields });

    try {
      csv += `STATISTICS\n${sensorStatsParser.parse(sensorStats)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const breachReportFields = [
      'Breach Type',
      'Breach Name',
      'Start date',
      'End date',
      'Exposure Duration (minutes)',
      'Min Temp',
      'Max Temp',
    ];
    const breachReportParser = new Parser({ fields: breachReportFields });
    try {
      csv += `BREACHES\n${breachReportParser.parse(breachReport)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const logReportFields = [
      'Timestamp',
      'Temperature',
      'Is cumulative breach',
      'Is continuous breach',
      'Logging Interval (Minutes)',
    ];

    const logReportParser = new Parser({ fields: logReportFields });

    try {
      csv += `LOGS\n${logReportParser.parse(logsReport)}`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const directory = '/Download/cce';
    const now = moment().format('DD-MM-YYYY-HHmm');
    const file = `/${now}.csv`;
    await this.requestStoragePermission();
    const path = `${RNFS.ExternalStorageDirectoryPath}${directory}${file}`;

    try {
      await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}${directory}`);
      await RNFS.writeFile(path, csv, 'utf8');

      // eslint-disable-next-line no-empty
    } catch (e) {}

    Mailer.mail(
      {
        subject: `Temperature log report for ${sensor.name ?? sensor.macAddress} from ${username}`,
        body: comment,
        attachments: [{ path, type: 'csv' }],
      },
      () => {}
    );

    return path;
  };
}
