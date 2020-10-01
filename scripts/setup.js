const OPTIONS_LOOKUP = {
  'mock-ble': 'MOCK_BLE',
  'redux-logger': 'REDUX_LOGGER',
  'query-logger': 'QUERY_LOGGER',
  'dev-logger': 'DEV_LOGGER',
};

const DEFAULT_OPTIONS = {
  [OPTIONS_LOOKUP['mock-ble']]: false,
  [OPTIONS_LOOKUP['redux-logger']]: false,
  [OPTIONS_LOOKUP['query-logger']]: false,
  [OPTIONS_LOOKUP['dev-logger']]: false,
};

const fs = require('fs');

const args = process.argv;

const options = args
  .filter(arg => arg.match(/--/gi))
  .map(option => option.slice(2))
  .filter(option => OPTIONS_LOOKUP[option])
  .reduce((acc, option) => ({ ...acc, [OPTIONS_LOOKUP[option]]: true }), DEFAULT_OPTIONS);

fs.writeFileSync('.env.json', JSON.stringify(options, null, 2));
