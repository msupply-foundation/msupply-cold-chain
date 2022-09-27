import { AppRegistry, LogBox } from 'react-native';

import App from './src/ui/App';

// Moment.js plugin for date ranges- importing at the root so it
// injects into moment.
import 'twix';
import { name as appName } from './app.json';

if (__DEV__) {
  require('./Reactotron.config');
}

LogBox.ignoreLogs([
  'Require cycle:',
  'isInitialValid',
  'execution time:',
  'query is slow:',
  'Setting a timer',
  'ImmutableStateInvariantMiddleware',
  'SerializableStateInvariantMiddleware',
  "Can't perform a React state update on an unmounted component",
  'Each child in a list should have a unique',
]);

AppRegistry.registerComponent(appName, () => App);
