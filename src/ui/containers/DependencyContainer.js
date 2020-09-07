import { useEffect, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';

import { Database, DatabaseService } from '~database';
import { SERVICES } from '~constants';
import { registerService } from '~services';

import { DeviceService } from '~services/device/DeviceService';
import { SensorManager } from '~sensor';

import { BleService } from '../../features/bluetooth';
import { SettingManager } from '../../features/setting/SettingManager';
import { BreachConfigurationManager } from '../../features/breachConfiguration';
import { ChartManager } from '../../features/chart';
import { BreachManager } from '../../features/breach';

import { LogTableManager } from '../../features/logTable';
import { DownloadManager } from '../../features/bluetooth/download';

const bleManager = new BleManager();

export const DependencyContainer = props => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);

    const db = new Database();
    const dbService = new DatabaseService(db);
    const deviceService = new DeviceService();
    const settingManager = new SettingManager(dbService);
    const breachConfigurationManager = new BreachConfigurationManager(dbService);
    const chartManager = new ChartManager(dbService);
    const breachManager = new BreachManager(dbService);
    const logTableManager = new LogTableManager(dbService);
    const downloadManager = new DownloadManager(dbService);

    (async () => {
      await db.getConnection();
      setReady(true);
      await deviceService.requestStoragePermission();
    })();

    const sensorsManager = new SensorManager(dbService);

    const btService = new BleService(bleManager);

    registerService(SERVICES.BREACH_CONFIGURATION_MANAGER, breachConfigurationManager);
    registerService(SERVICES.SENSOR_MANAGER, sensorsManager);
    registerService(SERVICES.DEVICE, deviceService);
    registerService(SERVICES.BLUETOOTH, btService);
    registerService(SERVICES.DATABASE, dbService);
    registerService(SERVICES.SETTING_MANAGER, settingManager);
    registerService(SERVICES.CHART_MANAGER, chartManager);
    registerService(SERVICES.BREACH_MANAGER, breachManager);
    registerService(SERVICES.LOG_TABLE_MANAGER, logTableManager);
    registerService(SERVICES.DOWNLOAD_MANAGER, downloadManager);
  }, []);

  const { children } = props;

  return ready ? children : null;
};
