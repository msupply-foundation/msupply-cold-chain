import { combineReducers } from 'redux';
import { SensorReducer } from '~features/Sensor';
import { SettingReducer } from '~features/Setting';
import { BreachConfigurationReducer } from '~features/BreachConfiguration';
import { ChartReducer } from '../../features/Chart';
import { BreachReducer } from '../../features/Breach';
import { LogTableReducer } from '../../features/LogTable';
import { BluetoothReducer } from '../../features/Bluetooth';
import { REDUCER } from '../constants';
import { ReportReducer } from '../../features/Report';
import { SensorStatusReducer } from '../../features/SensorStatus';

export const RootReducer = combineReducers({
  [REDUCER.SENSOR]: SensorReducer,
  [REDUCER.SETTING]: SettingReducer,
  [REDUCER.BREACH_CONFIGURATION]: BreachConfigurationReducer,
  [REDUCER.CHART]: ChartReducer,
  [REDUCER.BREACH]: BreachReducer,
  [REDUCER.LOG_TABLE]: LogTableReducer,
  [REDUCER.BLUETOOTH]: BluetoothReducer,
  [REDUCER.REPORT]: ReportReducer,
  [REDUCER.SENSOR_STATUS]: SensorStatusReducer,
});
