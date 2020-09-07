import { combineReducers } from 'redux';
import { BluetoothReducer } from '~bluetooth/bluetoothSlice';
import { DatabaseReducer } from '~database';
import { SensorReducer } from '~sensor';
import { SettingReducer } from '~setting';
import { TemperatureLogReducer } from '~temperatureLog';
import { BreachConfigurationReducer } from '~breachConfiguration';
import { HydrateReducer } from '../../features/hydrate/hydrateSlice';
import { ChartReducer } from '../../features/chart';
import { BreachReducer } from '../../features/breach';
import { DeviceReducer } from '../../services/device';
import { LogTableReducer } from '../../features/logTable';
import { TemperatureDownloadAction } from '../../features/temperatureDownload/temperatureDownloadSlice';

export const RootReducer = combineReducers({
  bluetooth: BluetoothReducer,
  database: DatabaseReducer,
  sensor: SensorReducer,
  setting: SettingReducer,
  breachConfiguration: BreachConfigurationReducer,
  temperatureLog: TemperatureLogReducer,
  hydrate: HydrateReducer,
  chart: ChartReducer,
  breach: BreachReducer,
  device: DeviceReducer,
  logTable: LogTableReducer,
  temperatureDownload: TemperatureDownloadAction,
});
