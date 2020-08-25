import { combineReducers } from 'redux';
import { BluetoothReducer } from '~bluetooth/bluetoothSlice';
import { DatabaseReducer } from '~database';
import { SensorReducer } from '~sensor';
import { SettingReducer } from '~setting';
import { BreachConfigurationReducer } from '~breachConfiguration';

export const RootReducer = combineReducers({
  bluetooth: BluetoothReducer,
  database: DatabaseReducer,
  sensor: SensorReducer,
  setting: SettingReducer,
  breachConfiguration: BreachConfigurationReducer,
});
