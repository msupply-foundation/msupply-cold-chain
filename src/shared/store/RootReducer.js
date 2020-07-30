import { combineReducers } from 'redux';
import { BluetoothReducer } from '~bluetooth/bluetoothSlice';
import { DatabaseReducer } from '~database';

export const RootReducer = combineReducers({
  bluetooth: BluetoothReducer,
  database: DatabaseReducer,
});
