import { BTUtilService } from '../BTUtilService';
import { MacAddress } from '../types/common';
import { Characteristic, TypedDevice, InfoLog, MonitorCharacteristicCallback, MonitorCharacteristicParser, ScanCallback, SensorLog, DataLog } from './types';
import { BluetoothManager, MockOrRealDevice } from './BleManager';
export declare class BleService {
    manager: BluetoothManager;
    utils: BTUtilService;
    constructor(manager: BluetoothManager);
    connectToDevice: (deviceId: string) => Promise<MockOrRealDevice>;
    connectAndDiscoverServices: (deviceDescriptor: string) => Promise<TypedDevice>;
    stopScan: () => void;
    scanForSensors: (callback: ScanCallback) => void;
    writeCharacteristic: (device: TypedDevice, command: string) => Promise<Characteristic>;
    monitorCharacteristic: (device: TypedDevice, callback: MonitorCharacteristicCallback<boolean | SensorLog[] | InfoLog | DataLog>, transactionId: string) => Promise<boolean | SensorLog[] | InfoLog | DataLog>;
    transactionId: () => string;
    writeAndMonitor: (device: TypedDevice, command: string, parser: MonitorCharacteristicParser<string[], SensorLog[] | InfoLog | DataLog>) => Promise<boolean | InfoLog | SensorLog[] | DataLog>;
    writeWithSingleResponse: (device: TypedDevice, command: string, parser: MonitorCharacteristicParser<string, boolean>) => Promise<boolean | SensorLog[] | InfoLog | DataLog>;
    downloadLogs: (macAddress: MacAddress) => Promise<SensorLog[]>;
    updateLogInterval: (macAddress: MacAddress, logInterval: number, clearLogs?: boolean) => Promise<boolean>;
    blink: (macAddress: MacAddress) => Promise<boolean>;
    getInfo: (macAddress: MacAddress) => Promise<InfoLog>;
    toggleButton: (macAddress: MacAddress) => Promise<boolean>;
    getInfoWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<InfoLog>;
    toggleButtonWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<boolean>;
    downloadLogsWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<SensorLog[]>;
    blinkWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<boolean>;
    updateLogIntervalWithRetries: (macAddress: MacAddress, logInterval: number, retriesLeft: number, clearLogs: boolean, error: Error | null) => Promise<boolean>;
}
