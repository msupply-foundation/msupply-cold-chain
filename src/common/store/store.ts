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

export type RootState = ReturnType<typeof RootReducer>;

SagaMiddleware.run(RootSaga);

// Sets up hot module reloading for reducers.
if (__DEV__ && module.hot) {
  module.hot.accept(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { RootReducer: reducer } = require('./RootReducer');
    store.replaceReducer(reducer);
  });
}

export { store };
