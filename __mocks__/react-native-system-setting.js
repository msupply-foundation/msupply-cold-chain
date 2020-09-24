export default {
  isBluetoothEnabled: async () => true,
  switchBluetooth: async () => null,
  isLocationEnabled: async () => true,
  addLocationModeListener: callback => callback(true),
  addBluetoothListener: callback => callback(true),
};
