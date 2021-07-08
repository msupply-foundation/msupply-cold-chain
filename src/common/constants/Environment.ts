import { MOCK_BLE, REDUX_LOGGER, DEV_LOGGER, QUERY_LOGGER } from 'react-native-dotenv';

type EnvironmentKey = 'MOCK_BLE' | 'DEV_LOGGER' | 'QUERY_LOGGER' | 'REDUX_LOGGER';
type ImportedEnvironmentShape = Record<EnvironmentKey, 'true' | 'false'>;
type EnvironmentShape = Record<EnvironmentKey, boolean | string>;

const ENV_VARS: ImportedEnvironmentShape = { MOCK_BLE, REDUX_LOGGER, DEV_LOGGER, QUERY_LOGGER };

const ENVIRONMENT: EnvironmentShape = {
  MOCK_BLE: false,
  REDUX_LOGGER: false,
  DEV_LOGGER: false,
  QUERY_LOGGER: false,
};

// (Object.keys(ENV_VARS) as Array<keyof typeof ENV_VARS>).forEach(key => {
//   const envKey = key;
//   const envVal = ENV_VARS[envKey];
//   if (envVal.toLowerCase() === 'true' || envVal.toLowerCase() === 'false') {
//     ENVIRONMENT[envKey] = Boolean(envVal.toLowerCase() === 'true');
//   } else {
//     ENVIRONMENT[envKey] = envVal;
//   }
// });

export { ENVIRONMENT };
