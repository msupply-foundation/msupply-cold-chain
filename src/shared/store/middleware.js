import { getDefaultMiddleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

/**
 * Redux middleware config
 */

const middleware = [];

/**
 * Redux toolkit middleware
 * https://redux-toolkit.js.org/api/getDefaultMiddleware
 */

const defaultMiddlewareOptions = {
  // These are actions which have non-serializable payloads. It is ...
  // ... recommended to ensure state is serializable. Payloads should
  // not be saved in the store.
  serializableCheck: { ignoredActions: ['setBluetoothService'] },
  thunk: false,
};
middleware.concat(getDefaultMiddleware(defaultMiddlewareOptions));

/**
 * Dev environment middleware
 */

if (__DEV__) {
  // Logs all action dispatching, current state and previous ...
  // ... state to the console.
  // Options API: https://github.com/LogRocket/redux-logger
  middleware.push(createLogger({ timestamp: true, colors: {} }));

  // Tracks redux store and actions dispatched in flipper.
  // https://github.com/jk-gan/redux-flipper
  const createDebugger = require('redux-flipper').default;
  middleware.push(createDebugger());
}

export { middleware };
