/**
 * Redux enhancer config
 */

const enhancers = [];

if (__DEV__) {
  const { reactotron } = require('../../../Reactotron.config');
  enhancers.push(reactotron.createEnhancer());
}

export { enhancers };
