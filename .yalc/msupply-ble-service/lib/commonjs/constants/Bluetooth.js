'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.BLUE_MAESTRO = exports.BLUETOOTH = void 0;
let BLUETOOTH;
exports.BLUETOOTH = BLUETOOTH;

(function (BLUETOOTH) {
  BLUETOOTH['UART_SERVICE_UUID'] = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  BLUETOOTH['READ_CHARACTERISTIC_UUID'] = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  BLUETOOTH['WRITE_CHARACTERISTIC_UUID'] = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
  BLUETOOTH[(BLUETOOTH['SCAN_MODE_LOW_LATENCY'] = 2)] = 'SCAN_MODE_LOW_LATENCY';
})(BLUETOOTH || (exports.BLUETOOTH = BLUETOOTH = {}));

const BLUE_MAESTRO = {
  COMMANDS: {
    BLINK: '*blink',
    DOWNLOAD: '*logall',
    INFO: '*info',
    UPDATE_LOG_INTERVAL: '*lint',
    DISABLE_BUTTON: '*bd',
  },
  MANUFACTURER_ID: 307,
  DELIMITER_A: 11776,
  DELIMITER_B: 11308,
  TEMPERATURE_DIVISOR: 10.0,
};
exports.BLUE_MAESTRO = BLUE_MAESTRO;
//# sourceMappingURL=Bluetooth.js.map
