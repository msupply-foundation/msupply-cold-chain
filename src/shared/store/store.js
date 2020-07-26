import { configureStore } from '@reduxjs/toolkit';

import RootReducer from './RootReducer';

import { enhancers } from './enhancers';
import { middleware } from './middleware';

const store = configureStore({
  reducer: RootReducer,
  devTools: false,
  middleware,
  enhancers,
});

// Sets up hot module reloading for reducers.
if (__DEV__ && module.hot) {
  module.hot.accept(
    () => './RootReducer',
    () => {
      const nextReducer = require('./RootReducer').default;

      store.replaceReducer(nextReducer);
    }
  );
}

export { store };
