import { configureStore } from '@reduxjs/toolkit';
import { SagaMiddleware, RootSaga } from './RootSaga';
import { RootReducer } from './RootReducer';
import { enhancers } from './enhancers';
import { middleware } from './middleware';

const store = configureStore({
  reducer: RootReducer,
  devTools: false,
  middleware,
  enhancers,
});

export type RootState = ReturnType<typeof store.getState>;

SagaMiddleware.run(RootSaga);

// Sets up hot module reloading for reducers.
if (__DEV__ && module.hot) {
  module.hot.accept(() => {
    const { RootReducer } = require('./RootReducer');
    store.replaceReducer(RootReducer);
  });
}

export { store };
