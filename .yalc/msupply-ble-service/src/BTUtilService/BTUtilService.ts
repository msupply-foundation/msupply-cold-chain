// This just here to satisfy TS for now
// We're really using the UtilService passed into the bleService constructor
// By the main app
//

type NumberRange = [number, number];

export class BTUtilService {
  /**
   * Convert to Fahrenheit
   */
  toFahrenheit = (celsius: number): number => Math.round((celsius * 9.0) / 5.0) + 320.0;

  bufferFromBase64 = (base64: string): Buffer => Buffer.from(base64, 'base64');

  stringFromBase64 = (base64: string): string => this.bufferFromBase64(base64).toString('utf-8');

  base64FromString = (string: string): string => Buffer.from(string, 'utf-8').toString('base64');
  /**
   * Normalises a number within some number range i.e. [75-100] into the corresponding
   * number within 0-100.
   */
  normaliseNumber = (currentVal: number, oldRange: NumberRange, newRange = [0, 100]): number => {
    const [oldMin, oldMax] = oldRange;
    const [newMin, newMax] = newRange;

    const newVal = ((currentVal - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;

    return Math.floor(newVal);
  };
}
