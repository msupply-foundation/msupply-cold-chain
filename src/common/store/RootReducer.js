import { combineReducers } from 'redux';
import { DatabaseReducer } from '~database';
import { SensorReducer } from '~sensor';
import { SettingReducer } from '~setting';
import { BreachConfigurationReducer } from '~breachConfiguration';
import { HydrateReducer } from '../../features/hydrate/hydrateSlice';
import { ChartReducer } from '../../features/chart';
import { BreachReducer } from '../../features/breach';
import { DeviceReducer } from '../../services/device';
import { LogTableReducer } from '../../features/logTable';
import { BluetoothReducer2 } from '../../features/bluetooth';

export const RootReducer = combineReducers({
  database: DatabaseReducer,
  sensor: SensorReducer,
  setting: SettingReducer,
  breachConfiguration: BreachConfigurationReducer,
  hydrate: HydrateReducer,
  chart: ChartReducer,
  breach: BreachReducer,
  device: DeviceReducer,
  logTable: LogTableReducer,
  bluetooth: BluetoothReducer2,
});
