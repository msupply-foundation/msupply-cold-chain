function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// This just here to satisfy TS for now
// We're really using the UtilService passed into the bleService constructor
// By the main app
//
export class BTUtilService {
  constructor() {
    _defineProperty(this, "toFahrenheit", celsius => Math.round(celsius * 9.0 / 5.0) + 320.0);

    _defineProperty(this, "bufferFromBase64", base64 => Buffer.from(base64, 'base64'));

    _defineProperty(this, "stringFromBase64", base64 => this.bufferFromBase64(base64).toString('utf-8'));

    _defineProperty(this, "base64FromString", string => Buffer.from(string, 'utf-8').toString('base64'));

    _defineProperty(this, "normaliseNumber", (currentVal, oldRange, newRange = [0, 100]) => {
      const [oldMin, oldMax] = oldRange;
      const [newMin, newMax] = newRange;
      const newVal = (currentVal - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin;
      return Math.floor(newVal);
    });
  }

}
//# sourceMappingURL=BTUtilService.js.map