export declare enum BLUETOOTH {
    UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
    READ_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
    WRITE_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
    SCAN_MODE_LOW_LATENCY = 2
}
export declare const BLUE_MAESTRO: {
    COMMANDS: {
        BLINK: string;
        DOWNLOAD: string;
        INFO: string;
        UPDATE_LOG_INTERVAL: string;
        DISABLE_BUTTON: string;
    };
    MANUFACTURER_ID: number;
    DELIMITER_A: number;
    DELIMITER_B: number;
    TEMPERATURE_DIVISOR: number;
};
