import { combineReducers } from 'redux';
import { REDUCER } from '../constants';
import { EntitiesReducer } from '~features/Entities';
import { ChartReducer } from '~features/Chart';
import { BreachReducer } from '~features/Breach';
import { SensorDetailReducer } from '~features/SensorDetail';
import { BluetoothReducer } from '~features/Bluetooth';
import { ReportReducer } from '~features/Report';
import { SensorStatusReducer } from '~features/SensorStatus';
import { PermissionReducer } from '~features/Permission';
import { SyncReducer } from '~features/Sync';
import { DevReducer } from '~features/Dev';
import { HydrateReducer } from '~features/Hydrate';

export const RootReducer = combineReducers({
  [REDUCER.ENTITIES]: EntitiesReducer,
  [REDUCER.CHART]: ChartReducer,
  [REDUCER.BREACH]: BreachReducer,
  [REDUCER.BLUETOOTH]: BluetoothReducer,
  [REDUCER.REPORT]: ReportReducer,
  [REDUCER.SENSOR_STATUS]: SensorStatusReducer,
  [REDUCER.PERMISSION]: PermissionReducer,
  [REDUCER.SENSOR_DETAIL]: SensorDetailReducer,
  [REDUCER.SYNC]: SyncReducer,
  [REDUCER.DEV]: DevReducer,
  [REDUCER.HYDRATE]: HydrateReducer,
});
