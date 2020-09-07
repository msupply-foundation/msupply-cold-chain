import { getDefaultMiddleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { SagaMiddleware } from './RootSaga';

/**
 * Redux middleware config
 */

const middleware = [];

/**
 * Redux toolkit middleware
 * https://redux-toolkit.js.org/api/getDefaultMiddleware
 */

const defaultMiddlewareOptions = {
  thunk: false,
};
middleware.concat(getDefaultMiddleware(defaultMiddlewareOptions));

/**
 * Redux Saga
 * https://redux-saga.js.org/
 */
middleware.push(SagaMiddleware);

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
