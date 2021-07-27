/// <reference types="node" />
declare type NumberRange = [number, number];
export declare class BTUtilService {
    /**
     * Convert to Fahrenheit
     */
    toFahrenheit: (celsius: number) => number;
    bufferFromBase64: (base64: string) => Buffer;
    stringFromBase64: (base64: string) => string;
    base64FromString: (string: string) => string;
    /**
     * Normalises a number within some number range i.e. [75-100] into the corresponding
     * number within 0-100.
     */
    normaliseNumber: (currentVal: number, oldRange: NumberRange, newRange?: number[]) => number;
}
export {};
