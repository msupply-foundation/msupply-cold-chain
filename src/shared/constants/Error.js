export const BLUETOOTH_SERVICE_ERROR = {
  NO_MANUFACTURER_ID: `BluetoothService requires a manufacturerId field within the config. A config was passed without one!`,
  NO_MANUFACTURER_ID_SET: `BluetoothService requires a manufacturerId field within the config. The config doesn't have one!`,
  NO_MAC_ADDRESS: `BluetoothService.sendCommand requires a mac address string to be passed. [For example: 'DB:56:07:61:C7:13'], but none was passed!`,
  NO_COMMAND: `BluetoothService.sendCommand requires a command string to be passed. [For example: '*blink'], but none was passed!`,
  INVALID_INTERVAL: `BluetoothService.setLogInterval or BluetoothService.setAdvertisementInterval require a number to be passed within the bounds set as MIN_INTERVAL and MAX_INTERVAL`,
};

export const SERVICE_LOCATOR_ERROR = {
  SERVICE_NOT_REGISTERED: `The service key passed is not registered`,
  CANT_DELETE_SERVICES: 'Can only delete services in a development environment',
  SERVICE_NOT_SUPPORTED: `The service key passed is not supported`,
  MUST_REGISTER_A_KEY: `A service being registered must have a string passed as for a key`,
};

export const DATABASE_UTIL_ERROR = {
  CREATE_SENSOR_LOGS_WITH_NO_TEMPERATURE: 'A sensor log was passed with no temperature',
  CREATE_SENSOR_LOGS_WITH_NO_SENSOR: 'A sensor must be passed to create sensor logs',
  CREATE_SENSOR_LOGS_INVALID_SENSOR:
    'A sensor passed must have the fields id and logInterval to create sensor logs',
  CREATE_SENSOR_LOGS_INVALID_NUMBER: 'The max number of logs was not a number greater than 0',
  CALCULATE_NO_LOGS_INVALID_INTERVAL:
    'The log interval passed to calculate the number of logs to save is invalid',
  MAP_LOGS_INVALID_LOGS: 'The logs passed to map logs are invalid',
  MAP_LOGS_INVALID_TIMESTAMP: 'The timestamp passed to map logs was invalid',
  AGGREGATE_SENSOR_LOGS_INVALID_SENSOR_ID:
    'The sensor logs being aggregated are from differing sensors, with different IDs',
  AGGREGATE_SENSOR_LOGS_NO_TEMPERATURE: 'A sensor log being aggregated has no temperature',
  AGGREGATE_SENSOR_LOGS_NO_TIMESTAMP: 'A sensor log being aggregated has no timestamp',
  AGGREGATE_SENSOR_LOGS_INVALID_LOGS: 'The logs to aggregate were invalid',
  CALCULATE_TEMPERATURE_LOG_SIZE_INVALID_NUMBER: 'A number passed was invalid',
  CREATE_TEMPERATURE_LOGS_INVALID_NUMBER: 'The number passed to create temperature logs is invalid',
  CREATE_TEMPERATURE_LOGS_INVALID_LOGS: 'The logs passed to create temperature logs is invalid',
  CREATE_TEMPERATURE_LOGS_INVALID_LOG: 'A log passed to create temperature logs is invalid',
  CLOSE_BREACH_INVALID_BREACH: 'The breach passed is invalid',
  CLOSE_BREACH_HAS_END_TIME: 'The breach passed has already ended',
  CREATE_BREACH_INVALID_CONFIG: 'The breach configuration passed is invalid',
  CREATE_BREACH_INVALID_SENSOR: 'The sensor passed is invalid',
  WILL_CREATE_BREACH_INVALID_CONFIG: 'The breach configuration passed is invalid',
  WILL_CREATE_BREACH_INVALID_LOGS: 'The array of logs passed is invalid',
  WILL_CREATE_BREACH_INVALID_LOG: 'A logs passed is invalid',
  ADD_LOG_TO_BREACH_INVALID_BREACH: 'The breach passed is invalid',
  ADD_LOG_TO_BREACH_LOG_ALREADY_BREACHED:
    'The log passed to add to a temperature breach, has already been added to one previously.',
};

export const UI_ASSERTIONS = {
  LARGE_HEADER: 'Children of LargeHeader can only be a single string',
};
