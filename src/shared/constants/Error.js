export const BLUETOOTH_SERVICE_ERROR = {
  NO_MANUFACTURER_ID: `BluetoothService requires a manufacturerId field within the config. A config was passed without one!`,
  NO_MANUFACTURER_ID_SET: `BluetoothService requires a manufacturerId field within the config. The config doesn't have one!`,
  NO_MAC_ADDRESS: `BluetoothService.sendCommand requires a mac address string to be passed. [For example: 'DB:56:07:61:C7:13'], but none was passed!`,
  NO_COMMAND: `BluetoothService.sendCommand requires a command string to be passed. [For example: '*blink'], but none was passed!`,
  INVALID_INTERVAL: `BluetoothService.setLogInterval or BluetoothService.setAdvertisementInterval require a number to be passed within the bounds set as MIN_INTERVAL and MAX_INTERVAL`,
};
