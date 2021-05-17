/* eslint-disable class-methods-use-this */
import { BLUETOOTH_STATE } from '../src/common/constants/Bluetooth';

class MockedBluetoothStatus {
  async getState() {
    return BLUETOOTH_STATE.ON;
  }
}

export const BluetoothStatus = new MockedBluetoothStatus();
