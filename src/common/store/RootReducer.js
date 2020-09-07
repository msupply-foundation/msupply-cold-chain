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
import { BluetoothReducer } from '../../features/bluetooth';
import { REDUCER } from '../constants';

export const RootReducer = combineReducers({
  [REDUCER.DATABASE]: DatabaseReducer,
  [REDUCER.SENSOR]: SensorReducer,
  [REDUCER.SETTING]: SettingReducer,
  [REDUCER.BREACH_CONFIGURATION]: BreachConfigurationReducer,
  [REDUCER.HYDRATE]: HydrateReducer,
  [REDUCER.CHART]: ChartReducer,
  [REDUCER.BREACH]: BreachReducer,
  [REDUCER.DEVICE]: DeviceReducer,
  [REDUCER.LOG_TABLE]: LogTableReducer,
  [REDUCER.BLUETOOTH]: BluetoothReducer,
});
