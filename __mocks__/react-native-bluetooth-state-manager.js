/* eslint-disable class-methods-use-this */
import { BLUETOOTH_STATE } from '~constants';

class BluetoothStateManager {
  async getState() {
    return BLUETOOTH_STATE.ON;
  }
}

export default new BluetoothStateManager();
