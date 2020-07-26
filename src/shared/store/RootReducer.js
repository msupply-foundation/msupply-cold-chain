import { createReducer } from '@reduxjs/toolkit';
import { BluetoothReducer } from '~bluetooth/bluetoothSlice';

console.log(BluetoothReducer);

export default createReducer({}, { bluetooth: BluetoothReducer });
