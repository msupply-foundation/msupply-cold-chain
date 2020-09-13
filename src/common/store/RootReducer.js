import { combineReducers } from 'redux';
import { SensorReducer } from '~sensor';
import { SettingReducer } from '~setting';
import { BreachConfigurationReducer } from '~breachConfiguration';
import { ChartReducer } from '../../features/chart';
import { BreachReducer } from '../../features/breach';
import { DeviceReducer } from '../services/DeviceFeature';
import { LogTableReducer } from '../../features/logTable';
import { BluetoothReducer } from '../../features/bluetooth';
import { REDUCER } from '../constants';
import { ReportReducer } from '../../features/Report';

export const RootReducer = combineReducers({
  [REDUCER.SENSOR]: SensorReducer,
  [REDUCER.SETTING]: SettingReducer,
  [REDUCER.BREACH_CONFIGURATION]: BreachConfigurationReducer,
  [REDUCER.CHART]: ChartReducer,
  [REDUCER.BREACH]: BreachReducer,
  [REDUCER.DEVICE]: DeviceReducer,
  [REDUCER.LOG_TABLE]: LogTableReducer,
  [REDUCER.BLUETOOTH]: BluetoothReducer,
  [REDUCER.REPORT]: ReportReducer,
});
