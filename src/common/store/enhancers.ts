import { StoreEnhancer } from 'redux';

/**
 * Redux enhancer config
 */

const enhancers: StoreEnhancer[] = [];

if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { reactotron } = require('../../../Reactotron.config');
  enhancers.push(reactotron.createEnhancer());
}

export { enhancers };
