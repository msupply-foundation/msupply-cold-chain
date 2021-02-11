import { StoreEnhancer } from 'redux';

/**
 * Redux enhancer config
 */

const enhancers: StoreEnhancer[] = [];

if (__DEV__) {
  const { reactotron } = require('../../../Reactotron.config');
  enhancers.push(reactotron.createEnhancer());
}

export { enhancers };
