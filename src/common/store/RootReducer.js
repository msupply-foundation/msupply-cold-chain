import { combineReducers } from 'redux';
import { EntitiesReducer } from '~features/Entities';
import { ChartReducer } from '../../features/Chart';
import { BreachReducer } from '../../features/Breach';
import { SensorDetailReducer } from '../../features/SensorDetail';
import { BluetoothReducer } from '../../features/Bluetooth';
import { REDUCER } from '../constants';
import { ReportReducer } from '../../features/Report';
import { SensorStatusReducer } from '../../features/SensorStatus';
import { PermissionReducer } from '~features/Permission';

export const RootReducer = combineReducers({
  [REDUCER.ENTITIES]: EntitiesReducer,
  [REDUCER.CHART]: ChartReducer,
  [REDUCER.BREACH]: BreachReducer,
  [REDUCER.BLUETOOTH]: BluetoothReducer,
  [REDUCER.REPORT]: ReportReducer,
  [REDUCER.SENSOR_STATUS]: SensorStatusReducer,
  [REDUCER.PERMISSION]: PermissionReducer,
  [REDUCER.SENSOR_DETAIL]: SensorDetailReducer,
});
