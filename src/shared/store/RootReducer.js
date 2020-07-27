import { combineReducers } from 'redux';
import { BluetoothReducer } from '~bluetooth/bluetoothSlice';

export const RootReducer = combineReducers({ bluetooth: BluetoothReducer });
