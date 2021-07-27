import { BTUtilService } from '../BTUtilService';
import { MacAddress } from '../types/common';
import { Characteristic, BluetoothDevice, InfoLog, MonitorCharacteristicCallback, MonitorCharacteristicParser, ScanCallback, SensorLog } from './types';
import { BluetoothManager } from './BleManager';
export declare class BleService {
    manager: BluetoothManager;
    utils: BTUtilService;
    constructor(manager: BluetoothManager, utils: BTUtilService);
    connectToDevice: (macAddress: MacAddress) => Promise<BluetoothDevice>;
    connectAndDiscoverServices: (macAddress: MacAddress) => Promise<BluetoothDevice>;
    stopScan: () => void;
    scanForSensors: (callback: ScanCallback) => void;
    writeCharacteristic: (macAddress: MacAddress, command: string) => Promise<Characteristic>;
    monitorCharacteristic: (macAddress: MacAddress, callback: MonitorCharacteristicCallback<boolean | SensorLog[] | InfoLog>) => Promise<boolean | SensorLog[] | InfoLog>;
    writeAndMonitor: (macAddress: MacAddress, command: string, parser: MonitorCharacteristicParser<string[], SensorLog[] | InfoLog>) => Promise<boolean | InfoLog | SensorLog[]>;
    writeWithSingleResponse: (macAddress: MacAddress, command: string, parser: MonitorCharacteristicParser<string, boolean>) => Promise<boolean | InfoLog | SensorLog[]>;
    downloadLogs: (macAddress: MacAddress) => Promise<SensorLog[]>;
    updateLogInterval: (macAddress: MacAddress, logInterval: number) => Promise<boolean>;
    blink: (macAddress: MacAddress) => Promise<boolean>;
    getInfo: (macAddress: MacAddress) => Promise<InfoLog>;
    toggleButton: (macAddress: MacAddress) => Promise<boolean>;
    getInfoWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<InfoLog>;
    toggleButtonWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<boolean>;
    downloadLogsWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<SensorLog[]>;
    blinkWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<boolean>;
    updateLogIntervalWithRetries: (macAddress: MacAddress, logInterval: number, retriesLeft: number, error: Error | null) => Promise<boolean>;
}
