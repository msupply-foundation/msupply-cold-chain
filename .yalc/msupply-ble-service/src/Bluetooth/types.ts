import {
  ScanMode,
  Subscription,
  Characteristic,
  BleError,
  Device,
  ScanOptions,
  LogLevel,
} from 'react-native-ble-plx';

export interface BluetoothDevice {
  id: string;
}

export interface InfoLog {
  batteryLevel: null | number;
  isDisabled: boolean;
}

export interface SensorLog {
  temperature: number;
}

export interface ScanCallback {
  (error: BleError | null, device: Device | null): void;
}

export interface Resolver<ResolverResult> {
  (result: ResolverResult): void;
}

export interface ErrorRejector {
  (error: Error): void;
}

export interface MonitorCharacteristicCallback<ResolverResult> {
  (
    result: Characteristic | null,
    resolver: Resolver<ResolverResult>,
    rejector: ErrorRejector
  ): void;
}

export interface MonitorCharacteristicParser<ParserInput, ParserResult> {
  (result: ParserInput): ParserResult;
}

export { ScanMode, Subscription, Characteristic, BleError, Device, ScanOptions, LogLevel };
