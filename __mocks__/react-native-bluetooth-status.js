/* eslint-disable class-methods-use-this */
import { BLUETOOTH_STATE } from '~constants';

class MockedBluetoothStatus {
  async getState() {
    return BLUETOOTH_STATE.ON;
  }
}

export const BluetoothStatus = new MockedBluetoothStatus();
